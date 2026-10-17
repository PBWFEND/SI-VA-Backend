import app from "./app.js";

const PORT = 3008;

app.listen(PORT, () => {
  console.log(`RESTful API berjalan di http://localhost:${PORT}`);
});