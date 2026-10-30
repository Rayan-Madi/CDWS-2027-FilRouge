/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// React pour le JSX, Tailwind pour les utilitaires ; Vitest lit le champ test.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    // Un faux fetch posé par un test ne fuit pas dans le suivant
    unstubGlobals: true,
  },
});
