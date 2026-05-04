import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],

  build: {
    // Bryt upp den stora bundlen i mindre vendor-chunks så att browsern kan
    // cacha tunga bibliotek mellan deploys och så att första sidladdningen
    // inte behöver hämta hela appen på en gång.
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "mui-vendor": [
            "@mui/material",
            "@mui/x-date-pickers",
            "@emotion/react",
            "@emotion/styled",
          ],
          "date-vendor": ["date-fns"],
          "holidays-vendor": ["date-holidays"],
          "pdf-vendor": ["jspdf", "jspdf-autotable"],
          "icons-vendor": ["react-icons"],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },

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
