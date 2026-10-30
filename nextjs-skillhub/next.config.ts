import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Réglé par create-next-app 16.4 (TP 4) : une page part en coquille statique, le dynamique suit en streaming
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Le dépôt a d'autres package-lock.json (la landing, le projet Vite) : la racine de CE projet, c'est ici
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
