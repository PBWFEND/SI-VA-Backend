const buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Andi" },
  { id: 2, judul: "JavaScript Dasar", penulis: "Budi" },
  { id: 3, judul: "REST API", penulis: "Citra" },
];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function findAll() {
  await delay(200);
  return buku;
}
async function findById(id) {
  await delay(200);

  const hasil = buku.find((b) => b.id === Number(id));

  return hasil ?? null;
}

async function create(data) {
  await delay(200);

  const idBaru = buku.length + 1;

  const bukuBaru = {
    id: idBaru,
    ...data,
  };

  buku.push(bukuBaru);

  return bukuBaru;
}
async function update(id, data) {
  await delay(200);

  const index = buku.findIndex((b) => b.id === Number(id));

  if (index === -1) {
    return null;
  }

  buku[index] = {
    ...buku[index],
    ...data,
  };

  return buku[index];
}
async function remove(id) {
  await delay(200);
  const index = buku.findIndex((b) => b.id === Number(id));

  if (index === -1) {
    return null;
  }

  return buku.splice(index, 1)[0];
}
module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};