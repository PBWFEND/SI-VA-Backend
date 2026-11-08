
console.log("=== AKTIVITAS 3: SEKUENSIAL VS PARALEL ===");

// Fungsi untuk simulasi proses dengan waktu tunda
const proses = (waktu) => {
    return new Promise((resolve) => {
        setTimeout(resolve, waktu);
    });
};

// Proses dijalankan satu per satu
async function sekuensial() {
    console.log("\nMemulai proses sekuensial...");

    const mulai = Date.now();

    await proses(1000);
    await proses(2000);
    await proses(3000);

    const selesai = Date.now();

    console.log(
        "Waktu sekuensial:",
        selesai - mulai,
        "ms"
    );
}

// Proses dijalankan bersamaan
async function paralel() {
    console.log("\nMemulai proses paralel...");

    const mulai = Date.now();

    await Promise.all([
        proses(1000),
        proses(2000),
        proses(3000)
    ]);

    const selesai = Date.now();

    console.log(
        "Waktu paralel:",
        selesai - mulai,
        "ms"
    );
}

// Menjalankan kedua pengujian secara berurutan
async function jalankan() {
    await sekuensial();
    await paralel();
}

jalankan();
