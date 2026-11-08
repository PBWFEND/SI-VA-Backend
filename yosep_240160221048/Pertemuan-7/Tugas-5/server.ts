import "dotenv/config";
import { app } from "./app.ts";

const port = Number(process.env.PORT ?? 3008);

const server = app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

export default server;

