import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      input: {
        home: path.resolve(__dirname, "index.html"),
        privacy: path.resolve(__dirname, "privacy-policy/index.html"),
        terms: path.resolve(__dirname, "terms-of-service/index.html"),
      },
    },
  },
});
