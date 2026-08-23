import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    // En producción CloudFront enruta /api/* al origen EC2; en desarrollo lo hace el
    // dev server, de modo que las cookies de sesión sean siempre same-origin.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: false,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});
