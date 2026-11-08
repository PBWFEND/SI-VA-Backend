const baseUrl = "http://localhost:3009";

const testGetPengguna = async () => {
  console.log("\n=== TEST GET /pengguna ===");

  const response = await fetch(`${baseUrl}/pengguna`);
  const result = await response.json();

  console.log("Status:", response.status);
  console.log("Response:", result);

  if (response.status === 200) {
    console.log("GET berhasil");
  } else {
    console.log("GET gagal");
  }
};

const testPostPengguna = async () => {
  console.log("\n=== TEST POST /pengguna ===");

  const response = await fetch(`${baseUrl}/pengguna`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nim: "240160221099",
      nama: "Mahasiswa Tes",
      email: "mahasiswa.tes@gmail.com",
      role: "mahasiswa",
    }),
  });

  const result = await response.json();

  console.log("Status:", response.status);
  console.log("Response:", result);

  if (response.status === 201) {
    console.log("POST berhasil");
  } else {
    console.log("POST gagal");
  }
};

const testValidasiPengguna = async () => {
  console.log("\n=== TEST VALIDASI POST /pengguna ===");

  const response = await fetch(`${baseUrl}/pengguna`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nim: "240160221098",
      nama: "",
      email: "email-salah",
    }),
  });

  const result = await response.json();

  console.log("Status:", response.status);
  console.log("Response:", result);

  if (response.status === 400) {
    console.log("Validasi berhasil menolak data tidak valid");
  } else {
    console.log("Validasi gagal");
  }
};

const testDeletePengguna = async () => {
  console.log("\n=== TEST DELETE /pengguna/:nim ===");

  const response = await fetch(`${baseUrl}/pengguna/240160221099`, {
    method: "DELETE",
  });

  console.log("Status:", response.status);

  if (response.status === 204) {
    console.log("DELETE berhasil");
  } else {
    console.log("DELETE gagal");
  }
};

const main = async () => {
  try {
    await testGetPengguna();
    await testPostPengguna();
    await testValidasiPengguna();
    await testDeletePengguna();

    console.log("\n=== SEMUA PENGUJIAN SELESAI ===");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
};

main();
