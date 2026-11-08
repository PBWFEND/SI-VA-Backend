
import { prisma } from "../../client.js";

const formatAbsensi = (item) => ({
  ...item,
  tanggal: item.tanggal.toISOString().slice(0, 10),
});

export const ambilSemuaAbsensi = async (filter = {}) => {
  const where = {};

  if (filter.status) {
    where.status = {
      equals: filter.status,
      mode: "insensitive",
    };
  }

  if (filter.jabatan) {
    where.jabatan = {
      equals: filter.jabatan,
      mode: "insensitive",
    };
  }

  if (filter.tanggal) {
    const tanggal = new Date(`${filter.tanggal}T00:00:00.000Z`);
    const besok = new Date(tanggal);
    besok.setUTCDate(besok.getUTCDate() + 1);

    where.tanggal = {
      gte: tanggal,
      lt: besok,
    };
  }

  const data = await prisma.absensi.findMany({
    where,
    orderBy: { id: "asc" },
  });

  return data.map(formatAbsensi);
};

export const ambilAbsensiById = async (id) => {
  const data = await prisma.absensi.findUnique({
    where: { id },
  });

  return data ? formatAbsensi(data) : null;
};

export const buatAbsensi = async (data) => {
  const hasil = await prisma.absensi.create({
    data: {
      nama: data.nama.trim(),
      jabatan: data.jabatan.trim(),
      tanggal: new Date(`${data.tanggal}T00:00:00.000Z`),
      status: data.status,
    },
  });

  return formatAbsensi(hasil);
};

export const ubahAbsensi = async (id, data) => {
  const existing = await prisma.absensi.findUnique({
    where: { id },
  });

  if (!existing) return null;

  const dataUpdate = {};

  if (data.nama !== undefined) dataUpdate.nama = data.nama.trim();
  if (data.jabatan !== undefined) dataUpdate.jabatan = data.jabatan.trim();

  if (data.tanggal !== undefined) {
    dataUpdate.tanggal = new Date(`${data.tanggal}T00:00:00.000Z`);
  }

  if (data.status !== undefined) dataUpdate.status = data.status;

  const hasil = await prisma.absensi.update({
    where: { id },
    data: dataUpdate,
  });

  return formatAbsensi(hasil);
};

export const hapusAbsensi = async (id) => {
  const existing = await prisma.absensi.findUnique({
    where: { id },
  });

  if (!existing) return false;

  await prisma.absensi.delete({
    where: { id },
  });

  return true;
};
