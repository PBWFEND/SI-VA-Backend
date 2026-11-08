const BASE_URL = "http://localhost:3009/pengguna";

const nimTes = "240160221099";

async function testGetPengguna() {
  const response = await fetch(BASE_URL);
  console.log("GET daftar pengguna:", response.status);
}

async function testGetDetail() {
  const response = await fetch(`${BASE_URL}/${nimTes}`);
  console.log("GET detail pengguna:", response.status);
}

async function testPostPengguna() {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nim: nimTes,
      nama: "Mahasiswa Tes",
      email: "mahasiswa.tes@gmail.com",
      role: "mahasiswa",
    }),
  });

  console.log("POST pengguna:", response.status);
}

async function testPostInvalid() {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nim: "",
      nama: "",
      email: "email-salah",
      role: "mahasiswa",
    }),
  });

  console.log("POST data tidak valid:", response.status);
}

async function testPatchPengguna() {
  const response = await fetch(`${BASE_URL}/${nimTes}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nama: "Mahasiswa Tes Updated",
    }),
  });

  console.log("PATCH pengguna:", response.status);
}

async function testDeletePengguna() {
  const response = await fetch(`${BASE_URL}/${nimTes}`, {
    method: "DELETE",
  });

  console.log("DELETE pengguna:", response.status);
}

async function main() {
  try {
    await testGetPengguna();
    await testPostPengguna();
    await testGetDetail();
    await testPostInvalid();
    await testPatchPengguna();
    await testDeletePengguna();

    console.log("\nPengujian API selesai.");
  } catch (error) {
    console.error("Pengujian gagal:", error);
  }
}

main();
