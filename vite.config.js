import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],

  preview: {
    port: 5173,
    strictPort: true,
  },

  server: {
    port: 5173,
    strictPort: true,
    host: false,
    origin: "http://0.0.0.0:5173",
    proxy: {
      "/api": {
        target: "http://localhost:5027",
        changeOrigin: true,
        secure: false,
      },
      "/spring-api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/spring-api/, "/api"),
      },
    },
  },
});
