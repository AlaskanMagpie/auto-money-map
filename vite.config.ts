import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the GitHub Pages project path: https://<user>.github.io/auto-money-map/
export default defineConfig({
  base: "/auto-money-map/",
  plugins: [react()],
});
