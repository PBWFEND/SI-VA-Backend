
console.log("=== AKTIVITAS 1: REFACTORING KODE ===");

// Fungsi menggunakan arrow function dan default value
const buatPesan = (daftar = []) => {
    // Destructuring untuk mengambil harga dan jumlah
    const total = daftar.reduce(
        (akumulasi, { harga, jumlah }) => {
            return akumulasi + harga * jumlah;
        },
        0
    );

    // Template literal untuk menampilkan total
    return `Total: ${total}`;
};

// Data barang
const barang = [
    { harga: 15000, jumlah: 2 },
    { harga: 12000, jumlah: 3 },
    { harga: 5000, jumlah: 1 }
];

// Menampilkan hasil
console.log(buatPesan(barang));
console.log(buatPesan());
