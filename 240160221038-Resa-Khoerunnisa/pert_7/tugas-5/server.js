
import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3006);

const server = app.listen(port, () => {
  console.log(`REST API berjalan di http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Server gagal dijalankan:", error);
});
