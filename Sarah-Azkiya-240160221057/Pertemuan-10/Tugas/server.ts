import { app } from "./app.ts";

const PORT = process.env.PORT ?? 3010;

app.listen(PORT, () => {
  console.log(`Server Pertemuan 10 (JWT & Authorization) berjalan di port ${PORT}`);
});

