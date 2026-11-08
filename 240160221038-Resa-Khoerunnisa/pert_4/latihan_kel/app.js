/**
 * Latihan Kelompok Pertemuan 4
 * Konversi node:http menjadi Express.js
 */

import express from "express";

const app = express();

// Data mahasiswa dari Pertemuan 3
const students = [
    {
        nim: "240160221038",
        nama: "Resa Khoerunnisa"
    },
    {
        nim: "240160221001",
        nama: "Aldi restu fauzi"
    },
    {
        nim: "240160221018",
        nama: "Khoirunnisa sholeha"
    }
];

// 1. Middleware logger
app.use((request, response, next) => {
    console.log(
        `[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`
    );
    next();
});

// 2. Middleware parser JSON
app.use(express.json());

// 3. Route GET: menampilkan semua mahasiswa
app.get("/students", (request, response) => {
    response.status(200).json({
        success: true,
        total: students.length,
        data: students
    });
});

// Route GET: menampilkan mahasiswa berdasarkan NIM
app.get("/students/:nim", (request, response) => {
    const nim = request.params.nim;

    const student = students.find(item => item.nim === nim);

    if (!student) {
        return response.status(404).json({
            success: false,
            message: "Mahasiswa tidak ditemukan"
        });
    }

    response.status(200).json({
        success: true,
        data: student
    });
});

// Route POST: menambahkan mahasiswa
app.post("/students", (request, response) => {
    const { nim, nama } = request.body ?? {};

    if (
        typeof nim !== "string" ||
        nim.trim() === "" ||
        typeof nama !== "string" ||
        nama.trim() === ""
    ) {
        return response.status(400).json({
            success: false,
            message: "NIM dan nama wajib diisi"
        });
    }

    const nimSudahAda = students.some(item => item.nim === nim.trim());

    if (nimSudahAda) {
        return response.status(409).json({
            success: false,
            message: "NIM sudah terdaftar"
        });
    }

    const studentBaru = {
        nim: nim.trim(),
        nama: nama.trim()
    };

    students.push(studentBaru);

    response.status(201).json({
        success: true,
        message: "Data mahasiswa berhasil ditambahkan",
        data: studentBaru
    });
});

// 4. Handler 404
app.use((request, response) => {
    response.status(404).json({
        success: false,
        message: `Endpoint ${request.method} ${request.originalUrl} tidak ditemukan`
    });
});

// 5. Error handler
app.use((error, request, response, next) => {
    console.error("Terjadi kesalahan:", error.message);

    if (response.headersSent) {
        return next(error);
    }

    response.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server"
    });
});

export default app;