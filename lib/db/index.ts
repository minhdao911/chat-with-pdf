import { neon, neonConfig } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("database url not found");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);
