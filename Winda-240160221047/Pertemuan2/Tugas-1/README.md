# Laporan Tugas 1 — Mini-Service Absensi (Node.js)
**Nama:** Winda Nurhidayah
**Npm :** 240160221047 

---

## A. Perbandingan Refactor (Sebelum & Sesudah)

### 1. Sebelum (Kode Warisan / Legacy Code)
```javascript
function formatDataAbsensi(data) {
  var hasilAkhir = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].status == "Hadir") {
      var info = "Nama: " + data[i].nama + " - Waktu: " + data[i].waktu;
      hasilAkhir.push(info);
    }
  }
  return hasilAkhir;
}

**Sesudah (Refactor ES6+)**
const formatDataAbsensi = (data, statusFilter = "Hadir") => {
  return data
    .filter(({ status }) => status === statusFilter)
    .map(({ nama, waktu }) => `Nama: ${nama} - Waktu: ${waktu}`);
};