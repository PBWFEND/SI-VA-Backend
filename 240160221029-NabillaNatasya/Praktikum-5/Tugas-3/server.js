import app from "./app.js";

const port = Number(process.env.PORT ?? 3006);

app.listen(port, () => {
  console.log(`REST API berjalan di http://localhost:${port}`);
});