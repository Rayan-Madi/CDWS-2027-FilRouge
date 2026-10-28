// Serveur statique des tests : sert src/ comme GitHub Pages, et sait provoquer les pannes du TP 3
// (cours, 5.5) : un chemin déclaré dans `pannes` répond son code d'erreur, ou attend avant de répondre.
// Lancé seul (npm run servir), il sert la page sur http://localhost:8000 pour un essai à la main.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

export const RACINE_SRC = fileURLToPath(new URL("../../src/", import.meta.url));

/**
 * @param {{ racine?: string, port?: number }} [options]
 * @returns {Promise<{ url: string, pannes: Map<string, { statut?: number, delai?: number }>, arreter: () => Promise<void> }>}
 */
export async function demarrerServeur({ racine = RACINE_SRC, port = 0 } = {}) {
  /** @type {Map<string, { statut?: number, delai?: number }>} */
  const pannes = new Map();

  const serveur = http.createServer(async (requete, reponse) => {
    let chemin;
    try {
      chemin = decodeURIComponent(new URL(requete.url ?? "/", "http://x").pathname);
    } catch {
      reponse.writeHead(400).end(); // « /% » : une adresse mal encodée ne doit pas faire tomber le serveur
      return;
    }
    const panne = pannes.get(chemin);
    if (panne?.delai) {
      await new Promise((fin) => setTimeout(fin, panne.delai));
    }
    if (panne?.statut) {
      reponse.writeHead(panne.statut, { "Content-Type": "text/html; charset=utf-8" });
      reponse.end(`<!DOCTYPE html><title>${panne.statut}</title><p>Erreur ${panne.statut}</p>`);
      return;
    }
    const fichier = path.join(racine, chemin.endsWith("/") ? `${chemin}index.html` : chemin);
    if (!fichier.startsWith(racine)) {
      reponse.writeHead(403).end();
      return;
    }
    try {
      const contenu = await fs.readFile(fichier);
      reponse.writeHead(200, {
        "Content-Type": TYPES[path.extname(fichier)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      reponse.end(contenu);
    } catch {
      reponse.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      reponse.end("<!DOCTYPE html><title>404</title><p>Introuvable</p>");
    }
  });

  await new Promise((pret) => serveur.listen(port, "127.0.0.1", () => pret(undefined)));
  const adresse = serveur.address();
  const numero = typeof adresse === "object" && adresse ? adresse.port : port;

  return {
    url: `http://127.0.0.1:${numero}/`,
    pannes,
    arreter: () =>
      new Promise((fin) => {
        serveur.closeAllConnections();
        serveur.close(() => fin(undefined));
      }),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { url } = await demarrerServeur({ port: Number(process.env.PORT ?? 8000) });
  console.log(`SkillHub servi sur ${url.replace("127.0.0.1", "localhost")} (Ctrl+C pour arrêter)`);
}
