import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // GitHub Pages needs /Trackyad/ as the base (set via VITE_MOCK_MODE in deploy.yml).
  // Vercel and local dev serve from the root /.
  const base = env.VITE_MOCK_MODE === "true" ? "/Trackyad/" : "/";

  return {
    base,
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
  };
});
