import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import cartographer from "@replit/vite-plugin-cartographer"; // <-- importa direttamente

const basePath = process.cwd();

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [cartographer()]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(basePath, "client", "src"),
      "@shared": path.resolve(basePath, "shared"),
      "@assets": path.resolve(basePath, "attached_assets"),
    },
  },
  root: path.resolve(basePath, "client"),
  build: {
    outDir: path.resolve(basePath, "dist/public"),
    emptyOutDir: true,
  },
});

