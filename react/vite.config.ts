/// <reference types="vitest/config" />
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { CHEMINS } from "./src/router/chemins.ts";

/** L'adresse de l'application sur GitHub Pages. Absolue : avec une base relative (« ./ »),
    /ateliers/git-initiation chercherait ses fichiers dans /ateliers/assets/. */
const BASE_EN_LIGNE = "/CDWS-2027-FilRouge/react/";

/** Les routes sans paramètre et à un seul niveau : /ateliers, /formateurs, /inscription, /mon-espace. */
const ROUTES_FIXES: string[] = Object.values(CHEMINS).flatMap((chemin) =>
  typeof chemin === "string" && chemin !== "/" && !chemin.slice(1).includes("/") ? [chemin] : [],
);

/** GitHub Pages sert « ateliers.html » pour « /ateliers » : une copie de index.html par route fixe, et le
    rechargement direct répond 200 tout de suite. Les autres adresses (une fiche, /mon-espace/…) passent
    par le 404.html de la racine du site, qui renvoie vers l'application. */
function copiesDesRoutesFixes(): Plugin {
  let sortie = "";
  return {
    name: "skillhub:copies-des-routes-fixes",
    apply: "build",
    configResolved(config) {
      sortie = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const route of ROUTES_FIXES) {
        copyFileSync(resolve(sortie, "index.html"), resolve(sortie, `${route.slice(1)}.html`));
      }
    },
  };
}

// React pour le JSX, Tailwind pour les utilitaires ; Vitest lit le champ test.
export default defineConfig(({ command, isPreview }) => ({
  // En développement, l'application vit à la racine (http://localhost:5173/). Construite et servie
  // (build, preview), elle vit sous la base de GitHub Pages : on vérifie ce qui sera publié.
  base: command === "build" || isPreview ? BASE_EN_LIGNE : "/",
  plugins: [react(), tailwindcss(), copiesDesRoutesFixes()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    // Un faux fetch posé par un test ne fuit pas dans le suivant
    unstubGlobals: true,
  },
}));
