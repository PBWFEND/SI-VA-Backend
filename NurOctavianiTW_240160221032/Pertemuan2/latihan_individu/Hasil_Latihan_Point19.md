# Dokumentasi Point 19 — Latihan Individu Pertemuan 2

**Nama:** Nur Octaviani Tri Wulandari
**NIM:** 240160221032
**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Pertemuan:** 12 
**File program:** `latihan.js`
**File Modul:** `modul-02.js`

---

## 1.Tujuan

Latihan individu Pertemuan 2 bertujuan untuk memahami dan menerapkan konsep ES6+ dan asynchronous programming pada JavaScript yang digunakan dalam pengembangan backend.

Konsep yang diterapkan dalam latihan ini meliputi:

Destructuring dan template literal.
map() dan reduce().
filter() dan spread operator.
Promise dan async/await.
Promise.all().
Template literal multi-baris dan padEnd() untuk membuat formatter struk.

Latihan dibuat dengan studi kasus sederhana berupa data transaksi dan laporan penjualan beberapa cabang.

## 2.Tools yang digunakan

Tools yang digunakan dalam pengerjaan latihan:

Visual Studio Code — digunakan untuk menulis dan mengedit kode JavaScript.
Node.js — digunakan untuk menjalankan program melalui terminal.
PowerShell — digunakan sebagai terminal untuk menjalankan file latihan.js.

Perintah yang digunakan untuk menjalankan program:

node latihan.js

## 3.Data transaksi

Program menggunakan data transaksi berupa tiga item sebagai berikut:

ID	Nama	Harga	Jumlah
1	Kopi Hitam	Rp15.000	2
2	Roti Bakar	Rp12.000	3
3	Air Mineral	Rp5.000	10

Data tersebut disimpan dalam variabel transaksi dalam bentuk array of object.

Perhitungan subtotal masing-masing item:

Kopi Hitam = Rp15.000 × 2 = Rp30.000
Roti Bakar = Rp12.000 × 3 = Rp36.000
Air Mineral = Rp5.000 × 10 = Rp50.000

Sehingga total transaksi adalah:

Rp30.000 + Rp36.000 + Rp50.000 = Rp116.000

## 4.Implementasi dan hasil

4.1 Latihan 1 — Destructuring + Template Literal

Pada latihan pertama digunakan destructuring untuk mengambil data item pertama dari array transaksi, kemudian hasilnya ditampilkan menggunakan template literal.

Kode:

const [itemPertama] = transaksi;
const { nama, harga } = itemPertama;

console.log(`Item pertama: ${nama} (${formatRupiah(harga)})`);

Penjelasan:

const [itemPertama] = transaksi digunakan untuk mengambil elemen pertama dari array. Selanjutnya, const { nama, harga } = itemPertama digunakan untuk mengambil property nama dan harga dari object.

Template literal digunakan untuk menggabungkan teks dengan nilai variabel, sedangkan formatRupiah() digunakan untuk menampilkan harga dalam format Rupiah.

Hasil:

Item pertama: Kopi Hitam (Rp15.000)

4.2 Latihan 2 — map + reduce

Pada latihan kedua digunakan map() untuk menghitung subtotal setiap item berdasarkan harga dan jumlah. Selanjutnya, reduce() digunakan untuk menjumlahkan seluruh subtotal menjadi total transaksi.

Kode:

const subtotal = transaksi.map(
  (item) => item.harga * item.jumlah
);

const total = subtotal.reduce(
  (acc, nilai) => acc + nilai,
  0
);

console.log("Subtotal tiap item:", subtotal);
console.log("Total struk:", formatRupiah(total));

Penjelasan:

map() menghasilkan subtotal untuk setiap transaksi, sedangkan reduce() menjumlahkan seluruh nilai subtotal.

Hasil perhitungannya adalah:

Kopi Hitam = Rp30.000
Roti Bakar = Rp36.000
Air Mineral = Rp50.000

Sehingga total transaksi adalah Rp116.000.

Hasil:

Subtotal tiap item: [ 30000, 36000, 50000 ]
Total struk: Rp116.000

4.3 Latihan 3 — filter + spread

Pada latihan ketiga digunakan filter() untuk mengambil item dengan harga lebih dari Rp10.000. Kemudian map() digunakan untuk mengambil nama item dan spread operator digunakan untuk membuat array baru.

Kode:

const itemTermahal = [
  ...transaksi
    .filter((item) => item.harga > 10000)
    .map((item) => item.nama),
];

console.log("Item dengan harga > 10000:", itemTermahal);

Penjelasan:

Kondisi item.harga > 10000 membuat hanya item dengan harga lebih dari Rp10.000 yang dipilih. Dari data transaksi, item yang memenuhi kondisi tersebut adalah Kopi Hitam dan Roti Bakar.

Hasil:

Item dengan harga > 10000: [ 'Kopi Hitam', 'Roti Bakar' ]

4.4 Latihan 4 — Promise + async/await

Pada latihan keempat digunakan Promise untuk mensimulasikan proses pembayaran yang membutuhkan waktu. Proses tersebut kemudian dijalankan menggunakan async/await.

Kode:

function prosesPembayaran(total, delayMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const kembali =
        total > 100000 ? hitungDiskon(total, 10) : total;

      resolve({
        status: "lunas",
        total,
        kembali,
      });
    }, delayMs);
  });
}

async function proses() {
  const hasil = await prosesPembayaran(total, 500);
  console.log("Hasil pembayaran:", hasil);
}

proses();

Penjelasan:

Fungsi prosesPembayaran() mengembalikan sebuah Promise. setTimeout() digunakan untuk memberikan delay selama 500 ms.

Jika total transaksi lebih dari Rp100.000, maka digunakan fungsi hitungDiskon() dengan diskon 10%.

Total transaksi sebesar Rp116.000 sehingga:

Diskon = 10% × Rp116.000 = Rp11.600
Total setelah diskon = Rp116.000 - Rp11.600 = Rp104.400

Fungsi proses() menggunakan await untuk menunggu hasil dari prosesPembayaran().

Hasil:

Hasil pembayaran: { status: 'lunas', total: 116000, kembali: 104400 }

4.5 Latihan 5 — Promise.all

Pada latihan kelima digunakan Promise.all() untuk menjalankan tiga proses pengiriman laporan dari cabang secara bersamaan.

Kode:

const tunda = (ms, nilai) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(nilai), ms)
  );

async function laporanCabang() {
  const mulai = Date.now();

  const hasil = await Promise.all([
    tunda(200, 50),
    tunda(300, 80),
    tunda(100, 70),
  ]);

  const totalLaporan = hasil.reduce(
    (acc, nilai) => acc + nilai,
    0
  );

  console.log("Laporan cabang:", hasil);
  console.log("Total laporan:", totalLaporan);
  console.log("Waktu eksekusi:", Date.now() - mulai, "ms");
}

laporanCabang();

Penjelasan:

Tiga proses memiliki delay yang berbeda, yaitu 200 ms, 300 ms, dan 100 ms. Dengan Promise.all(), ketiga proses dijalankan secara bersamaan.

Nilai laporan yang diperoleh adalah:

50 + 80 + 70 = 200

Waktu eksekusi diukur menggunakan Date.now().

Hasil:

Laporan cabang: [ 50, 80, 70 ]
Total laporan: 200
Waktu eksekusi: 314 ms

Waktu sekitar 314 ms menunjukkan bahwa proses berjalan secara paralel dan tidak menunggu ketiga delay secara berurutan.

4.6 Latihan 6 — Mini Formatter Struk

Latihan keenam merupakan latihan bonus untuk membuat tampilan struk transaksi menjadi lebih rapi. Konsep yang digunakan adalah map(), template literal, padEnd(), join(), dan formatRupiah().

Kode:

const struk = transaksi
  .map(
    (item, index) =>
      `${index + 1}. ${item.nama.padEnd(20)} x${item.jumlah}  ${formatRupiah(
        item.harga * item.jumlah
      )}`
  )
  .join("\n");

console.log(`
=== STRUK E-WARUNG ===
${struk}
`);

Penjelasan:

map() digunakan untuk membuat setiap baris struk. index + 1 digunakan sebagai nomor urut, sedangkan padEnd(20) digunakan untuk memberikan jarak pada nama item agar tampilan lebih rapi.

formatRupiah() digunakan untuk menampilkan subtotal dalam format Rupiah dan join("\n") digunakan untuk menggabungkan setiap baris struk.

Hasil:

=== STRUK E-WARUNG ===
1. Kopi Hitam           x2  Rp30.000
2. Roti Bakar           x3  Rp36.000
3. Air Mineral          x10  Rp50.000

## 5.Output keseluruhan program

Program dijalankan menggunakan perintah:

node latihan.js

Hasil yang diperoleh:

Item pertama: Kopi Hitam (Rp15.000)
Subtotal tiap item: [ 30000, 36000, 50000 ]
Total struk: Rp116.000
Item dengan harga > 10000: [ 'Kopi Hitam', 'Roti Bakar' ]

=== STRUK E-WARUNG ===
1. Kopi Hitam           x2  Rp30.000
2. Roti Bakar           x3  Rp36.000
3. Air Mineral          x10  Rp50.000

Laporan cabang: [ 50, 80, 70 ]
Total laporan: 200
Waktu eksekusi: 314 ms
Hasil pembayaran: { status: 'lunas', total: 116000, kembali: 104400 }

Waktu eksekusi dapat berbeda pada setiap kali program dijalankan karena dipengaruhi oleh kondisi sistem saat program dijalankan.

## 6.Analisis

Berdasarkan hasil latihan, konsep ES6+ dapat mempermudah proses pengolahan data dalam JavaScript. Destructuring digunakan untuk mengambil data dari array dan object, sedangkan map(), filter(), dan reduce() digunakan untuk mengolah data transaksi.

Pada bagian asynchronous, Promise digunakan untuk menangani proses yang membutuhkan waktu. async/await digunakan agar proses asynchronous lebih mudah dibaca dan dipahami. Selain itu, Promise.all() memungkinkan beberapa proses asynchronous dijalankan secara bersamaan.

Latihan ini juga menunjukkan penerapan konsep tersebut pada simulasi sederhana yang menyerupai proses backend, seperti transaksi, pembayaran, dan laporan penjualan.

## 7.Kesimpulan

Latihan Individu Pertemuan 2 berhasil diselesaikan menggunakan Node.js. Seluruh latihan pada file latihan.js berhasil dijalankan dan menghasilkan output sesuai dengan tujuan masing-masing.

Konsep yang berhasil diterapkan meliputi destructuring, template literal, map(), reduce(), filter(), spread operator, Promise, async/await, Promise.all(), dan padEnd().