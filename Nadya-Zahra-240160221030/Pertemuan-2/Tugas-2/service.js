
const absensi = [
  { id: "ABS001", anggota_id: "AGT001", kegiatan: "Rapat Pembahasan LDKM", tanggal: "2026-09-27", status: "hadir",},
  { id: "ABS002", anggota_id: "AGT002", kegiatan: "Rapat Pembahasan LDKM", tanggal: "2026-09-27", status: "hadir",},
  { id: "ABS003", anggota_id: "AGT003", kegiatan: "Rapat Program Kerja", tanggal: "2026-09-28", status: "hadir",},
];

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function findAll() {
  await delay(200);
  return absensi;
}

async function findById(id) {
  await delay(200);

  const hasil = absensi.find((b) => b.id === id);
  return hasil ?? null;
}

async function create(data) {
  await delay(200);

  const nomorTerbesar = absensi.reduce((terbesar, item) => {
    const nomor = Number(item.id.replace("ABS", ""));
    return Math.max(terbesar, nomor);
  }, 0);

  const idAbsensi = `ABS${String(nomorTerbesar + 1).padStart(3, "0")}`;

  const absensiBaru = {
    ...data,
    id: idAbsensi,
  };

  absensi.push(absensiBaru);
  return absensiBaru;
}

async function update(id, data) {
  await delay(200);

  const index = absensi.findIndex((b) => b.id === id);

  if (index === -1) {
    return null;
  }

  absensi[index] = {
    ...absensi[index],
    ...data,
  };

  return absensi[index];
}

async function remove(id) {
  await delay(200);

  const index = absensi.findIndex((b) => b.id === id);

  if (index === -1) {
    return null;
  }

  return absensi.splice(index, 1)[0];
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};