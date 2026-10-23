// Versi sesudah refactor

const tampilkanBuku = (buku, kategori = "Semua") => {
 

  const hasil = buku.map(({ judul }) => judul);

  console.log(`Kategori: ${kategori}`);
  console.log(`Daftar buku: ${hasil.join(", ")}`);
}

const dataBuku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Andi" },
  { id: 2, judul: "JavaScript Dasar", penulis: "Budi" },
  { id: 3, judul: "REST API", penulis: "Citra" },
];

tampilkanBuku(dataBuku);