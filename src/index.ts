import dotenv from "dotenv";
import app from "./app";
import { connectMongo } from "./db/mongo";

dotenv.config();

const PORT = Number(process.env.PORT ?? 8080);

async function main() {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
