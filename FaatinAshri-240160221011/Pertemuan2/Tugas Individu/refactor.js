/**
 * ============================================================
 * Refactor Kode Warisan
 * Resource: Buku
 * ============================================================
 */


// ============================================================
// VERSI SEBELUM REFACTOR
// ============================================================


const bukuLama = [
  {
    id: 1,
    judul: "Belajar Node.js",
    penulis: "Andi",
    tahun: 2024,
    stok: 3
  },
  {
    id: 2,
    judul: "Dasar JavaScript",
    penulis: "Budi",
    tahun: 2023,
    stok: 0
  }
];


function cariBukuLama(id) {
  for (let i = 0; i < bukuLama.length; i++) {
    if (bukuLama[i].id === id) {
      return bukuLama[i];
    }
  }

  return null;
}


function daftarJudulLama() {
  const hasil = [];

  for (let i = 0; i < bukuLama.length; i++) {
    hasil.push(bukuLama[i].judul);
  }

  return hasil;
}


// ============================================================
// VERSI SESUDAH REFACTOR
// ============================================================



const buku = [...bukuLama];


// arrow function
const cariBuku = (id) =>
  buku.find((item) => item.id === id) ?? null;


// map
const daftarJudul = (data = buku) =>
  data.map(({ judul }) => judul);


// destructuring + default value
const tampilkanBuku = ({
  judul,
  penulis = "Tidak diketahui"
}) => {
  return `${judul} ditulis oleh ${penulis}`;
};


// template literal
console.log(tampilkanBuku(buku[0]));

// destructuring
const { id, judul } = buku[0];

console.log(`Buku pertama: ${judul} (ID: ${id})`);

// array method: filter
const bukuTersedia = buku.filter(
  ({ stok }) => stok > 0
);

console.log("Buku tersedia:", daftarJudul(bukuTersedia));

console.log(
  "Cari buku ID 1:",
  cariBuku(1)
);

console.log(
  "Cari buku ID 999:",
  cariBuku(999)
);