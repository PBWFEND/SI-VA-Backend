const {
  findAll,
  findById,
  create,
  update,
  remove,
} = require("./service");
async function main() {
  const data = await findAll();

  console.log("Daftar buku:", data);

  const detail = await findById(2);

  console.log("Detail buku:", detail);

  const bukuBaru = await create({
  judul: "Pemrograman JavaScript",
  penulis: "",
  });

  console.log("Buku baru:", bukuBaru);

  const bukuDiubah = await update(2, {
  judul: "JavaScript Modern",
  });

  console.log("Buku setelah diubah:", bukuDiubah); 

  const [bukuSatu, bukuTiga] = await Promise.all([
  findById(1),
  findById(3),
  ]);

  console.log("Query paralel:", bukuSatu, bukuTiga);

 try {
  const bukuTidakAda = await findById(999);

  if (!bukuTidakAda) {
    throw new Error("Buku tidak ditemukan");
  }

  console.log("Buku:", bukuTidakAda);
} catch (error) {
  console.log("Error:", error.message);
}
}
main();