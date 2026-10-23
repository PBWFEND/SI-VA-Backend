#!/usr/bin/env python3
"""Generate blok ALL-CONTRIBUTORS (avatar + nama + NIM) dari API GitHub + git log."""
import json
import os
import re
import subprocess
import sys
import urllib.request

REPO = "PBWFEND/SI-VA-Backend"
README = "README.md"
START = "<!-- ALL-CONTRIBUTORS-LIST:START -->"
END = "<!-- ALL-CONTRIBUTORS-LIST:END -->"
MAINTAINERS = {"yysofiyan"}
NIM_RE = re.compile(r"2401\d{7,}")


def gh(path):
    url = f"https://api.github.com/{path}"
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {os.environ['GH_TOKEN']}",
        "User-Agent": "contrib-regen",
    })
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def git_stdout(args):
    try:
        return subprocess.run(
            ["git", *args], capture_output=True, text=True).stdout
    except OSError:
        return ""


def nim_from(refs):
    for r in refs:
        m = NIM_RE.search(r or "")
        if m:
            return m.group(0)
    return None


def nim_of(login, name, pr_refs):
    if login in MAINTAINERS:
        return None
    paths = git_stdout(["log", "--author", login, "--name-only",
                        "--pretty=format:", "-n", "500"])
    name_paths = git_stdout(["log", "--author", name or "", "--name-only",
                             "--pretty=format:", "-n", "500"])
    return (nim_from([login])
            or nim_from([paths])
            or nim_from(pr_refs.get(login, []))
            or nim_from([name_paths]))


def cell(c, name, nim):
    login = c["login"]
    role = "Dosen" if login in MAINTAINERS else (nim or "Mahasiswa")
    return f"""    <td align="center">
      <a href="{c["html_url"]}">
        <img src="{c["avatar_url"]}&s=200" width="100px;" alt="{login}"/><br>
        <sub><b>{name or login}</b></sub>
      </a><br>
      <sub>{role}</sub>
    </td>"""


def user_profile(login):
    try:
        u = gh(f"users/{login}")
        return {"login": u["login"], "html_url": u["html_url"], "avatar_url": u["avatar_url"]}
    except Exception:
        return None


def user_name(login):
    try:
        return gh(f"users/{login}").get("name")
    except Exception:
        return None


def is_bot(login):
    return login.endswith("[bot]") or login == "github-actions"


def pr_refs_map():
    refs = {}
    for p in gh(f"repos/{REPO}/pulls?state=all&per_page=100"):
        if is_bot(p["user"]["login"]):
            continue
        refs.setdefault(p["user"]["login"], []).append(p["head"]["ref"])
    return refs


def add_missing(cs, known, logins):
    for login in logins:
        if login in known or is_bot(login):
            continue
        c = user_profile(login)
        if c:
            cs.append(c)
            known.add(login)


def git_author_names():
    raw = git_stdout(["log", "--pretty=format:%an|%ae"])
    names = []
    for line in raw.splitlines():
        if "|" not in line:
            continue
        name, _ = line.split("|", 1)
        name = name.strip()
        if not name or "@" in name or is_bot(name):
            continue
        names.append(name)
    return names


def collect_contributors():
    cs = [c for c in gh(f"repos/{REPO}/contributors?per_page=100")
          if not is_bot(c["login"])]
    known = {c["login"] for c in cs}
    pr_refs = pr_refs_map()
    add_missing(cs, known, pr_refs)
    add_missing(cs, known, git_author_names())
    return cs, pr_refs


def build_table(cs, pr_refs):
    cells = []
    for c in cs:
        login = c["login"]
        name = user_name(login)
        cells.append(cell(c, name, nim_of(login, name, pr_refs)))
    rows = []
    for i in range(0, len(cells), 3):
        rows.append("  <tr>\n" + "\n".join(cells[i:i + 3]) + "\n  </tr>")
    return "### 👥 Contributors\n\n<table>\n" + "\n".join(rows) + "\n</table>\n"


def rewrite_readme(table):
    text = open(README, encoding="utf-8").read()
    if START not in text or END not in text:
        print("marker ALL-CONTRIBUTORS tidak ditemukan di README.md", file=sys.stderr)
        sys.exit(1)
    head, rest = text.split(START, 1)
    _, tail = rest.split(END, 1)
    new = head + START + "\n\n" + table + "\n" + END + tail
    if new == text:
        print("tidak ada perubahan")
        return
    open(README, "w", encoding="utf-8").write(new)
    print("README.md diperbarui")


def main():
    cs, pr_refs = collect_contributors()
    rewrite_readme(build_table(cs, pr_refs))


if __name__ == "__main__":
    main()
