/**
 * Server Latihan Kelompok Pertemuan 4
 */

import app from "./app.js";

const port = 3006;

app.listen(port, () => {
    console.log(
        `API Kelompok berjalan di http://localhost:${port}`
    );
});