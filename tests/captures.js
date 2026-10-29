// Livrable du TP 3 : les captures des quatre états, hors ligne et 404 comprises (docs/captures/fm03/).
// Lancer : npm run captures. Chaque capture est la section des ateliers, à 1280 puis 375 px.
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { demarrerServeur } from "./outils/serveur.js";
import { ouvrirNavigateur, nouvellePage } from "./outils/navigateur.js";

const DOSSIER = fileURLToPath(new URL("../docs/captures/fm03/", import.meta.url));
const JSON_ATELIERS = "/donnees/ateliers.json";
const LARGEURS = [1280, 375];

const pret = (page) => page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");

/** La section des ateliers, sans l'en-tête collant qui passerait par-dessus. */
async function capturer(page, nom) {
  await page.addStyleTag({ content: ".entete { position: static !important; } * { animation-play-state: paused !important; caret-color: transparent !important; }" });
  const section = await page.$("#ateliers");
  const chemin = `${DOSSIER}${nom}.png`;
  await section.screenshot({ path: chemin });
  console.log(`  ${nom}.png`);
}

const ETATS = {
  // 1. Chargement : la réponse est retenue 10 s, le temps de photographier les cartes fantômes
  async "1-chargement"(serveur, navigateur, largeur) {
    serveur.pannes.set(JSON_ATELIERS, { delai: 10000 });
    const page = await nouvellePage(navigateur, serveur.url, { largeur, attendre: false });
    await page.waitForSelector(".atelier-fantome");
    return page;
  },
  // 2. Vide : des critères qu'aucun atelier ne remplit
  async "2-vide"(serveur, navigateur, largeur) {
    const page = await nouvellePage(navigateur, serveur.url, { largeur });
    await pret(page);
    await page.select("#niveau", "avance");
    await page.type("#recherche", "portfolio");
    await page.waitForFunction(() => document.querySelector(".catalogue__statut").textContent.startsWith("Aucun"));
    return page;
  },
  // 3. Erreur 404 : le fichier « renommé », le serveur répond qu'il n'existe pas
  async "3-erreur-404"(serveur, navigateur, largeur) {
    serveur.pannes.set(JSON_ATELIERS, { statut: 404 });
    const page = await nouvellePage(navigateur, serveur.url, { largeur });
    await page.waitForSelector(".catalogue__panne");
    return page;
  },
  // 4. Erreur hors ligne : le réseau coupé comme par la case Offline de l'onglet Réseau, puis « Réessayer »
  async "4-erreur-hors-ligne"(serveur, navigateur, largeur) {
    serveur.pannes.set(JSON_ATELIERS, { statut: 503 });
    const page = await nouvellePage(navigateur, serveur.url, { largeur });
    await page.waitForSelector(".catalogue__panne");
    serveur.pannes.clear();
    await page.setOfflineMode(true);
    await page.click("[data-reessayer]");
    await page.waitForFunction(() => document.querySelector('.catalogue__panne [role="alert"]')?.textContent.includes("connexion"));
    return page;
  },
  // 5. Succès : le catalogue filtré, le compteur nomme les critères
  async "5-succes"(serveur, navigateur, largeur) {
    const page = await nouvellePage(navigateur, serveur.url, { largeur });
    await pret(page);
    await page.select("#niveau", "debutant");
    await page.select("#tri", "prix-croissant");
    return page;
  },
};

await fs.mkdir(DOSSIER, { recursive: true });
const serveur = await demarrerServeur();
const navigateur = await ouvrirNavigateur();
try {
  for (const [nom, preparer] of Object.entries(ETATS)) {
    for (const largeur of LARGEURS) {
      const page = await preparer(serveur, navigateur, largeur);
      await capturer(page, `${nom}-${largeur}`);
      await page.close();
      serveur.pannes.clear();
    }
  }
} finally {
  await navigateur.close();
  await serveur.arreter();
}
