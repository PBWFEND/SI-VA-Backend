function formatRupiah(angka) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(angka);
}

function hitungDiskon(harga, persen) {
  return harga - (harga * persen) / 100;
}

module.exports = { formatRupiah, hitungDiskon };