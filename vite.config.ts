import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "@server": path.resolve(__dirname, "./app/.server"),
    },
  },
  define: {
    CLIENT_PRODUCTION_URL: JSON.stringify(process.env.PRODUCTION_URL),
  },
  server: {
    watch: {
      ignored: ["**/logs/**"],
    },
  },
});
