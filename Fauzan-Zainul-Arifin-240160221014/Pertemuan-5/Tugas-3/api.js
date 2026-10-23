
import express from "express";

const app = express();
const PORT = 3008;

// Middleware
app.disable("x-powered-by");
app.use(express.json());

// Logger setiap request
app.use((request, response, next) => {
  console.log(`${request.method} ${request.originalUrl}`);
  next();
});

// Data mahasiswa sementara
const mahasiswa = [
  {
    nim: "F1D022001",
    nama: "Jhon Doe",
    prodi: "Sistem Informasi",
    angkatan: 2024,
  },
  {
    nim: "F1D022002",
    nama: "Ani Lestari",
    prodi: "Sistem Informasi",
    angkatan: 2023,
  },
];

// Format response JSON yang konsisten
const responseData = (response, statusCode, message, data) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// GET collection: seluruh mahasiswa + filter
app.get("/mahasiswa", (request, response) => {
  const { prodi, angkatan } = request.query;

  const data = mahasiswa.filter((item) => {
    const cocokProdi =
      prodi === undefined ||
      item.prodi.toLowerCase() === String(prodi).toLowerCase();

    const cocokAngkatan =
      angkatan === undefined ||
      item.angkatan === Number(angkatan);

    return cocokProdi && cocokAngkatan;
  });

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diambil",
    data
  );
});

// GET detail mahasiswa berdasarkan NIM
app.get("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  return responseData(
    response,
    200,
    "Detail mahasiswa berhasil diambil",
    item
  );
});


app.post("/mahasiswa", (request, response) => {
  const { nim, nama, prodi, angkatan } = request.body;

  // Validasi field wajib
  if (
    typeof nim !== "string" || !nim.trim() ||
    typeof nama !== "string" || !nama.trim() ||
    typeof prodi !== "string" || !prodi.trim() ||
    angkatan === undefined ||
    angkatan === null ||
    angkatan === "" ||
    !Number.isInteger(Number(angkatan)) ||
    Number(angkatan) <= 0
  ) {
    return response.status(400).json({
      success: false,
      message: "nim, nama, prodi, dan angkatan wajib diisi dengan format yang valid",
    });
  }

  // Validasi NIM duplikat
  const nimBaru = nim.trim();

  const sudahAda = mahasiswa.some(
    (item) => item.nim === nimBaru
  );

  if (sudahAda) {
    return response.status(400).json({
      success: false,
      message: "NIM sudah terdaftar",
    });
  }

  // Membuat data mahasiswa baru
  const dataBaru = {
    nim: nimBaru,
    nama: nama.trim(),
    prodi: prodi.trim(),
    angkatan: Number(angkatan),
  };

  mahasiswa.push(dataBaru);

  return responseData(
    response,
    201,
    "Mahasiswa berhasil ditambahkan",
    dataBaru
  );
});


app.put("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  const { nim, nama, prodi, angkatan } = request.body;

  // PUT harus menerima seluruh field
  if (
    typeof nim !== "string" || !nim.trim() ||
    typeof nama !== "string" || !nama.trim() ||
    typeof prodi !== "string" || !prodi.trim() ||
    angkatan === undefined ||
    angkatan === null ||
    angkatan === "" ||
    !Number.isInteger(Number(angkatan)) ||
    Number(angkatan) <= 0
  ) {
    return response.status(400).json({
      success: false,
      message: "nim, nama, prodi, dan angkatan wajib diisi dengan format yang valid",
    });
  }

  // NIM pada URL menjadi identitas tetap resource
  if (nim.trim() !== request.params.nim) {
    return response.status(400).json({
      success: false,
      message: "NIM pada body harus sama dengan NIM pada URL",
    });
  }

  item.nama = nama.trim();
  item.prodi = prodi.trim();
  item.angkatan = Number(angkatan);

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diganti",
    item
  );
});


app.patch("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  const { nama, prodi, angkatan } = request.body;
  const fields = ["nama", "prodi", "angkatan"];

  // Pastikan setidaknya satu field dikirim
  const adaField = fields.some(
    (field) => Object.hasOwn(request.body, field)
  );

  if (!adaField) {
    return response.status(400).json({
      success: false,
      message: "Minimal satu field harus diisi untuk diperbarui",
    });
  }

  // Validasi field yang dikirim
  if (
    (nama !== undefined &&
      (typeof nama !== "string" || !nama.trim())) ||
    (prodi !== undefined &&
      (typeof prodi !== "string" || !prodi.trim())) ||
    (angkatan !== undefined &&
      (angkatan === null ||
        angkatan === "" ||
        !Number.isInteger(Number(angkatan)) ||
        Number(angkatan) <= 0))
  ) {
    return response.status(400).json({
      success: false,
      message: "Data yang dikirim tidak valid",
    });
  }

  // Ubah hanya field yang dikirim
  if (nama !== undefined) item.nama = nama.trim();
  if (prodi !== undefined) item.prodi = prodi.trim();
  if (angkatan !== undefined) item.angkatan = Number(angkatan);

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diperbarui",
    item
  );
});


app.delete("/mahasiswa/:nim", (request, response) => {
  const index = mahasiswa.findIndex(
    ({ nim }) => nim === request.params.nim
  );

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  mahasiswa.splice(index, 1);

  // Berhasil menghapus: tidak mengirim body
  return response.status(204).end();
});


// Jalankan server
app.listen(PORT, () => {
  console.log(`REST API berjalan di http://localhost:${PORT}`);
});
