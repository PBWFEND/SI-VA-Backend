// Tugas 1 Pertemuan 2
// Mini-Service Sistem Informasi Absensi Organisasi

// Database in-memory
let absensi = [
  {
    id: 1,
    nim: "240160221022",
    nama: "Marsya Nurdrianti",
    tanggal: "2026-09-21",
    status: "Hadir",
  },
  {
    id: 2,
    nim: "240160221008",
    nama: "Dela Kartika",
    tanggal: "2026-09-21",
    status: "Izin",
  },
  {
    id: 3,
    nim: "240160221011",
    nama: "Fatin Ashri",
    tanggal: "2026-09-21",
    status: "Hadir",
  },
];

// Fungsi untuk simulasi waktu tunggu 100-300 ms
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = () =>
  Math.floor(Math.random() * 201) + 100;

// Mengambil semua data
const findAll = async () => {
  await delay(randomDelay());
  return absensi;
};

// Mengambil data berdasarkan ID
const findById = async (id) => {
  await delay(randomDelay());

  return absensi.find((item) => item.id === id) || null;
};

// Menambahkan data
const create = async (data) => {
  await delay(randomDelay());

  const newData = {
    id: absensi.length + 1,
    ...data,
  };

  absensi.push(newData);

  return newData;
};

// Mengubah data berdasarkan ID
const update = async (id, data) => {
  await delay(randomDelay());

  const index = absensi.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  absensi[index] = {
    ...absensi[index],
    ...data,
    id,
  };

  return absensi[index];
};

// Menghapus data berdasarkan ID
const deleteData = async (id) => {
  await delay(randomDelay());

  const index = absensi.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const deletedData = absensi.splice(index, 1);

  return deletedData[0];
};

// Export semua fungsi service
module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: deleteData,
};