/**
 * ============================================================
 * Pertemuan 2 — Contoh module sederhana
 * ============================================================
 * Satu file Node.js = satu module. Yang kita `module.exports`
 * itulah yang bisa di-import oleh file lain.
 *
 * Dipakai oleh: demo-es6.js dan latihan.js
 */

function formatRupiah(angka) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(angka);
}

function hitungDiskon(harga, persen) {
  return harga - (harga * persen) / 100;
}

module.exports = { formatRupiah, hitungDiskon };