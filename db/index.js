import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../.env" });
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.POSTGRES_URL);

export default db;
