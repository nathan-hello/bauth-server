import { defineConfig } from "drizzle-kit";
import { dotenv } from "../env";

export default defineConfig({
  out: "./app/.server/drizzle/migrations",
  schema: "./app/.server/drizzle/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dotenv.DB_FILE_NAME,
  },
});
