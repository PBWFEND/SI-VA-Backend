# Aktivitas Kelompok Pertemuan 2

## Anggota Kelompok 6

1. Dadika Yudiana
2. Faatin Ashri 
3. Marsya Nurdrianti

## Aktivitas 1 — Refactoring Kode
Pada aktivitas pertama, kelompok melakukan refactoring terhadap kode JavaScript yang diberikan. Tujuannya adalah memahami penggunaan fitur JavaScript modern agar kode menjadi lebih ringkas dan mudah dibaca.

Fitur yang digunakan antara lain arrow function, template literal, destructuring, default value, dan `reduce()`.

### Pembahasan
Refactoring dilakukan dengan tetap mempertahankan hasil program, tetapi mengubah cara penulisan kode agar lebih sesuai dengan JavaScript modern.

## Aktivitas 2 — Prediksi Output Synchronous dan Asynchronous
Pada aktivitas kedua, kelompok menganalisis bagian **Synchronous vs Asynchronous** dari file `demo-async.js`.

Kode yang dianalisis:

```js
console.log("1. --- Synchronous vs Asynchronous ---");
console.log("1. mulai (sync)");

setTimeout(() => console.log(
  "1. [async setTimeout 0ms] ← baru muncul sekarang!"
), 0);

console.log("1. selesai (sync) ← muncul duluan walau ditulis belakangan");
```

### Prediksi Kelompok
Sebelum menjalankan program, kelompok memperkirakan urutan output sebagai berikut:

```text
1. --- Synchronous vs Asynchronous ---
1. mulai (sync)
1. selesai (sync) ← muncul duluan walau ditulis belakangan
1. [async setTimeout 0ms] ← baru muncul sekarang!
```

Sebagian besar urutan dapat diperkirakan dari pembacaan kode. Namun, beberapa anggota masih ragu mengenai kapan callback dari `setTimeout()` dijalankan.

### Hasil Setelah Program Dijalankan
Setelah kode dijalankan, output menunjukkan bahwa bagian synchronous muncul terlebih dahulu, sedangkan callback `setTimeout()` muncul setelah kode synchronous selesai.

```text
1. --- Synchronous vs Asynchronous ---
1. mulai (sync)
1. selesai (sync) ← muncul duluan walau ditulis belakangan
1. [async setTimeout 0ms] ← baru muncul sekarang!
```

### Pembahasan
Kelompok memahami bahwa `setTimeout()` tetap bersifat asynchronous walaupun delay yang diberikan adalah `0 ms`. Callback tidak langsung dijalankan ketika baris tersebut dibaca, tetapi menunggu sampai proses synchronous yang sedang berjalan selesai.

## Aktivitas 3 — Promise.all dan Proses Paralel
Pada aktivitas ketiga, kelompok mempelajari penggunaan `Promise.all()` untuk menjalankan beberapa proses asynchronous secara bersamaan.

Contoh pada `demo-async.js`:

```js
const [buku2, anggota, peminjaman] = await Promise.all([
  tunda(300, "data buku"),
  tunda(200, "data anggota"),
  tunda(100, "data peminjaman"),
]);
```

### Prediksi Kelompok
Kelompok memperkirakan bahwa jika proses dijalankan secara berurutan, waktu yang dibutuhkan adalah:

```text
300 ms + 200 ms + 100 ms = 600 ms
```

Sedangkan dengan `Promise.all()`, waktu eksekusi diperkirakan mendekati proses dengan waktu paling lama, yaitu sekitar:

```text
300 ms
```

Pada awalnya beberapa anggota masih mengira bahwa ketiga delay akan dijumlahkan karena masing-masing proses memiliki waktu berbeda.

### Hasil Setelah Program Dijalankan
Hasil program menunjukkan bahwa proses dengan `Promise.all()` selesai dalam waktu yang mendekati delay terlama.

```text
5. hasil: {
  buku2: 'data buku',
  anggota: 'data anggota',
  peminjaman: 'data peminjaman'
}
5. total ±300ms (bukan 300+200+100=600ms)
```

Waktu aktual dapat sedikit berbeda dari 300 ms karena proses program dan kondisi komputer.

### Pembahasan
`Promise.all()` memungkinkan beberapa Promise yang tidak saling bergantung untuk diproses secara konkuren. Karena itu, waktu keseluruhan tidak menjadi 600 ms, tetapi mengikuti proses yang membutuhkan waktu paling lama, yaitu sekitar 300 ms.

## Kesimpulan
Aktivitas kelompok pada Pertemuan 2 membantu kelompok memahami JavaScript modern dan asynchronous programming.

Dari aktivitas refactoring, kelompok memahami bahwa arrow function, destructuring, template literal, default value, dan `reduce()` dapat membuat kode lebih ringkas.

Dari aktivitas prediksi output, kelompok memahami bahwa kode synchronous dijalankan terlebih dahulu sebelum callback asynchronous seperti `setTimeout()` diproses.

Dari penggunaan `Promise.all()`, kelompok memahami bahwa beberapa proses asynchronous yang independen dapat dijalankan secara konkuren sehingga waktu eksekusi dapat lebih singkat dibandingkan menjalankannya secara berurutan.
