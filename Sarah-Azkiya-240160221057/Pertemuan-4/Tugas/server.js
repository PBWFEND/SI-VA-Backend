
import app from "./app.js";

const PORT = 3006;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log("Tekan Ctrl + C untuk menghentikan server.");
});