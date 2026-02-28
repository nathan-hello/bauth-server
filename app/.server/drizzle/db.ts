import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { dotenv } from "../env";

const sqlite = new Database(dotenv.DB_FILE_NAME);
export const db = drizzle(sqlite, {
  schema,
});
