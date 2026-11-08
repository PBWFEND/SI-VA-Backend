
/**
 * Tugas 2 — REST API Absensi Organisasi
 * Menjalankan server Express.js pada port 3004.
 */

import app from "./app.js";

const port = 3004;

app.listen(port, () => {
    console.log(
        `API Absensi Organisasi berjalan di http://localhost:${port}`
    );
});
