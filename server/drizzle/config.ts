import { defineConfig } from "drizzle-kit";
import { dotenv } from "..";

export default defineConfig({
  out: "./server/drizzle/migrations",
  schema: "./server/drizzle/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dotenv.DB_FILE_NAME,
  },
});
