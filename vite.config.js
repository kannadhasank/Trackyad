import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Trackyad/",
  plugins: [react()],
  server: {
    // Keeps the browser on a single origin in dev, so no CORS preflight.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
