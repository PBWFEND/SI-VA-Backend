
/**
 * Tugas 2 Pertemuan 4 — REST API Absensi Organisasi
 * Menggunakan Express.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");

// Data awal absensi organisasi
const absensi = [
    {
        id: 1,
        nama: "Andi",
        jabatan: "Ketua",
        tanggal: "2026-09-28",
        status: "Hadir"
    },
    {
        id: 2,
        nama: "Siti",
        jabatan: "Sekretaris",
        tanggal: "2026-09-28",
        status: "Izin"
    },
    {
        id: 3,
        nama: "Rina",
        jabatan: "Bendahara",
        tanggal: "2026-09-28",
        status: "Hadir"
    }
];

let nextId = 4;

// Middleware JSON
app.use(express.json());

// Middleware logger
app.use((request, response, next) => {
    console.log(
        `[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`
    );
    next();
});

// GET: halaman utama API
app.get("/", (request, response) => {
    response.status(200).json({
        success: true,
        message: "REST API Absensi Organisasi",
        endpoints: [
            "GET /",
            "GET /health",
            "GET /absensi",
            "GET /absensi/:id",
            "GET /absensi?tanggal=2026-09-28",
            "GET /absensi?status=Hadir",
            "POST /absensi"
        ]
    });
});

// GET: memeriksa status server
app.get("/health", (request, response) => {
    response.status(200).json({
        success: true,
        status: "up"
    });
});

// GET: daftar absensi dan filter
app.get("/absensi", (request, response) => {
    const { tanggal, status } = request.query;
    let data = [...absensi];

    if (tanggal !== undefined) {
        if (
            typeof tanggal !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)
        ) {
            return response.status(400).json({
                success: false,
                message: "Format tanggal harus YYYY-MM-DD"
            });
        }

        data = data.filter(item => item.tanggal === tanggal);
    }

    if (status !== undefined) {
        const statusValid = ["Hadir", "Izin", "Sakit", "Alpa"];

        if (
            typeof status !== "string" ||
            !statusValid.includes(status)
        ) {
            return response.status(400).json({
                success: false,
                message: "Status harus Hadir, Izin, Sakit, atau Alpa"
            });
        }

        data = data.filter(item => item.status === status);
    }

    return response.status(200).json({
        success: true,
        total: data.length,
        data: data
    });
});

// GET: detail absensi berdasarkan ID
app.get("/absensi/:id", (request, response) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return response.status(400).json({
            success: false,
            message: "ID absensi harus berupa angka positif"
        });
    }

    const data = absensi.find(item => item.id === id);

    if (!data) {
        return response.status(404).json({
            success: false,
            message: "Data absensi tidak ditemukan"
        });
    }

    return response.status(200).json({
        success: true,
        data: data
    });
});

// POST: menambahkan data absensi
app.post("/absensi", (request, response) => {
    const { nama, jabatan, tanggal, status } = request.body ?? {};

    if (
        typeof nama !== "string" || nama.trim() === "" ||
        typeof jabatan !== "string" || jabatan.trim() === "" ||
        typeof tanggal !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)
    ) {
        return response.status(400).json({
            success: false,
            message: "Nama, jabatan, dan tanggal dengan format YYYY-MM-DD wajib diisi"
        });
    }

    const statusValid = ["Hadir", "Izin", "Sakit", "Alpa"];

    if (!statusValid.includes(status)) {
        return response.status(400).json({
            success: false,
            message: "Status harus Hadir, Izin, Sakit, atau Alpa"
        });
    }

    const dataBaru = {
        id: nextId++,
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        tanggal: tanggal,
        status: status
    };

    absensi.push(dataBaru);

    return response.status(201).json({
        success: true,
        message: "Data absensi berhasil ditambahkan",
        data: dataBaru
    });
});

// Handler 404
app.use((request, response) => {
    return response.status(404).json({
        success: false,
        message: `Endpoint ${request.method} ${request.originalUrl} tidak ditemukan`
    });
});

// Error middleware
app.use((error, request, response, next) => {
    console.error("Kesalahan aplikasi:", error.message);

    if (response.headersSent) {
        return next(error);
    }

    return response.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server"
    });
});

export default app;
