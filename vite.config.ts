import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouterHonoServer } from "react-router-hono-server/dev";
import path from "path";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    reactRouterHonoServer({
      runtime: "bun",
      serverEntryPoint: path.resolve(__dirname, "./server/index.ts"),
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "@server": path.resolve(__dirname, "./server"),
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
