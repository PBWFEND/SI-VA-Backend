
import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3008;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
