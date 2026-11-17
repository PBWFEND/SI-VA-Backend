import { readFile } from "node:fs/promises";

try {
  const isi = await readFile("data.txt", "utf8");
  console.log(isi);
} catch (error) {
  console.error("File gagal dibaca:", error.message);
}