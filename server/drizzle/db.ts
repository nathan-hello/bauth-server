import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const location = process.env.DB_FILE_NAME;
if (!location) {
  throw Error(".env: `DB_FILE_NAME` is required");
}

const sqlite = new Database(location);
export const db = drizzle(sqlite, {
  schema,
});
