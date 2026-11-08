/**
 * Test Runner untuk Latihan Individu Pertemuan 8
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 */

import {
  validasiInputBuku,
  validasiInputAnggota,
  ujiTambahBuku,
  ujiCariBukuById,
  ujiTambahAnggota,
  prisma,
} from "./latihan.ts";

async function main() {
  console.log("============================================================");
  console.log("  PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 8 — SARAH AZKIYA");
  console.log("  NIM: 240160221057 | STUDI KASUS: SISTEM INFORMASI PERPUSTAKAAN");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Validasi input buku judul kosong
    const v1 = validasiInputBuku({ judul: "", penulis: "Penulis A", tahun: 2024, stok: 5 });
    assert(!v1.valid && v1.error?.includes("judul"), "1. Validasi buku: judul kosong ditolak");

    // 2. Validasi input buku tahun < 1000
    const v2 = validasiInputBuku({ judul: "Buku A", penulis: "Penulis A", tahun: 999, stok: 5 });
    assert(!v2.valid && v2.error?.includes("tahun"), "2. Validasi buku: tahun < 1000 ditolak");

    // 3. Validasi input buku stok negatif
    const v3 = validasiInputBuku({ judul: "Buku A", penulis: "Penulis A", tahun: 2024, stok: -1 });
    assert(!v3.valid && v3.error?.includes("stok"), "3. Validasi buku: stok negatif ditolak");

    // 4. Validasi input buku valid
    const v4 = validasiInputBuku({ judul: "  Clean Architecture  ", penulis: "Robert C. Martin", tahun: 2017, stok: 10 });
    assert(v4.valid && v4.data?.judul === "Clean Architecture", "4. Validasi buku: data valid berhasil disanitasi");

    // 5. Validasi input anggota field wajib kosong
    const va1 = validasiInputAnggota({ nama: "Sarah", nim: "", jurusan: "SI" });
    assert(!va1.valid && va1.error?.includes("nim"), "5. Validasi anggota: NIM kosong ditolak");

    // 6. Validasi input anggota valid
    const va2 = validasiInputAnggota({ nama: "  Sarah Azkiya  ", nim: "240160221057", jurusan: "Sistem Informasi" });
    assert(va2.valid && va2.data?.nama === "Sarah Azkiya", "6. Validasi anggota: data valid berhasil disanitasi");

    // 7. Uji tambah buku berhasil (DB Integration)
    const tb = await ujiTambahBuku({
      judul: "Buku Latihan Individu P8",
      penulis: "Sarah Azkiya",
      tahun: 2026,
      stok: 7,
    });
    assert(tb.status === 201 && tb.success && typeof tb.data?.id === "number", "7. Integrasi DB: tambah buku berhasil mengembalikan status 201");
    const createdBukuId = tb.data?.id;

    // 8. Uji cari buku berdasarkan ID (200 OK)
    const cb = await ujiCariBukuById(createdBukuId!);
    assert(cb.status === 200 && cb.data?.judul === "Buku Latihan Individu P8", "8. Integrasi DB: cari buku berdasarkan ID mengembalikan status 200");

    // 9. Uji cari buku ID tidak ada (404 Not Found)
    const cb404 = await ujiCariBukuById(888888);
    assert(cb404.status === 404 && !cb404.success, "9. Integrasi DB: cari buku ID 888888 mengembalikan status 404 Not Found");

    // 10. Uji tambah anggota unik
    const uniqNim = `LATH-${Date.now()}`;
    const ta = await ujiTambahAnggota({
      nama: "Mahasiswa Latihan",
      nim: uniqNim,
      jurusan: "Sistem Informasi",
    });
    assert(ta.status === 201 && ta.success, "10. Integrasi DB: tambah anggota baru mengembalikan status 201");

    // 11. Uji tambah anggota duplikat NIM (409 Conflict)
    const taConflict = await ujiTambahAnggota({
      nama: "Mahasiswa Kloning",
      nim: uniqNim,
      jurusan: "Sistem Informasi",
    });
    assert(taConflict.status === 409 && !taConflict.success, "11. Integrasi DB: tambah anggota duplikat NIM mengembalikan status 409 Conflict");

    // 12. Cleanup data uji latihan
    if (createdBukuId) {
      await prisma.buku.delete({ where: { id: createdBukuId } });
    }
    await prisma.anggota.deleteMany({ where: { nim: uniqNim } });
    assert(true, "12. Cleanup data uji berhasil dilakukan");

    console.log("\n============================================================");
    console.log(`  HASIL LATIHAN INDIVIDU: ${passed} lolos, ${failed} gagal.`);
    console.log(`  Persentase Keberhasilan: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log("============================================================\n");
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});

