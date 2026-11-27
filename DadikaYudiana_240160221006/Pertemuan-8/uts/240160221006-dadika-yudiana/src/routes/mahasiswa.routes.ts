
import { Router } from "express";
import { mahasiswaController } from "../controller/mahasiswa.controller.ts";

// Inisialisasi router untuk pengelolaan mahasiswa
const routerMahasiswa = Router();

// Endpoint untuk menampilkan dan menambahkan data mahasiswa
routerMahasiswa.route("/")
  .get(mahasiswaController.getAll)
  .post(mahasiswaController.create);

// Endpoint untuk mengakses data berdasarkan NIM
routerMahasiswa.route("/:nim")
  .get(mahasiswaController.getByNim)
  .patch(mahasiswaController.update)
  .delete(mahasiswaController.delete);

// Export router untuk digunakan oleh aplikasi
export { routerMahasiswa as router };

export default routerMahasiswa;
