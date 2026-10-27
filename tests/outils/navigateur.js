// Le navigateur des tests de bout en bout : Chrome ou Edge déjà installés, sans fenêtre.
// puppeteer-core ne télécharge aucun navigateur ; NAVIGATEUR=<chemin> en impose un.
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const CANDIDATS = [
  process.env.NAVIGATEUR,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter((c) => c !== undefined && c !== "" && fs.existsSync(c));

// Le premier qui démarre : sur certains postes, Edge se referme aussitôt (démarrage confié à une instance déjà ouverte)
export async function ouvrirNavigateur() {
  const echecs = [];
  for (const executablePath of CANDIDATS) {
    try {
      return await puppeteer.launch({
        executablePath,
        headless: true,
        protocolTimeout: 30000, // un appel au navigateur qui ne revient pas échoue, au lieu de tout bloquer
        // Sur les machines d'intégration continue (Ubuntu 24), le bac à sable de Chrome est refusé par AppArmor
        args: process.env.CI ? ["--no-sandbox"] : [],
      });
    } catch (erreur) {
      echecs.push(`${executablePath} : ${erreur instanceof Error ? erreur.message.split("\n")[0] : erreur}`);
    }
  }
  throw new Error(`Aucun navigateur Chromium n'a démarré : installez Chrome ou Edge, ou indiquez NAVIGATEUR=<chemin>.\n${echecs.join("\n")}`);
}

/**
 * Une page neuve à la taille demandée. Les erreurs de la console sont relevées dans `page.erreurs` :
 * une page saine n'en a aucune (les échecs réseau provoqués exprès sont filtrés par le test).
 * @param {import("puppeteer-core").Browser} navigateur
 * @param {string} url
 * @param {{ largeur?: number, hauteur?: number, attendre?: boolean }} [options]
 */
export async function nouvellePage(navigateur, url, { largeur = 1280, hauteur = 900, attendre = true } = {}) {
  const page = await navigateur.newPage();
  /** @type {string[]} */
  const erreurs = [];
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });
  page.on("pageerror", (erreur) => erreurs.push(String(erreur)));
  Object.assign(page, { erreurs });
  page.setDefaultTimeout(15000);
  await page.setViewport({ width: largeur, height: hauteur });
  if (url) {
    await page.goto(url, { waitUntil: attendre ? "load" : "domcontentloaded" });
  }
  return /** @type {import("puppeteer-core").Page & { erreurs: string[] }} */ (page);
}

/** Description courte de l'élément qui a le focus : « button#id.classe "texte" ». */
export function elementActif(page) {
  return page.evaluate(() => {
    const e = document.activeElement;
    if (!e || e === document.body) return "body";
    const id = e.id ? `#${e.id}` : "";
    const classe = typeof e.className === "string" && e.className ? `.${e.className.trim().split(/\s+/).join(".")}` : "";
    const texte = (e.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    return `${e.tagName.toLowerCase()}${id}${classe}${texte ? ` "${texte}"` : ""}`;
  });
}

/**
 * Les écouteurs posés sur un élément (ou sur `document`), relevés par le protocole DevTools :
 * c'est ce que montre l'onglet « Écouteurs d'événements » des outils de développement.
 * @param {import("puppeteer-core").Page} page
 * @param {string} selecteur un sélecteur CSS, ou "document"
 * @returns {Promise<string[]>} les types d'événements, un par écouteur
 */
export async function ecouteurs(page, selecteur) {
  const session = await page.createCDPSession();
  try {
    const expression = selecteur === "document" ? "document" : `document.querySelector(${JSON.stringify(selecteur)})`;
    const { result } = await session.send("Runtime.evaluate", { expression });
    if (!result.objectId) throw new Error(`Élément introuvable : ${selecteur}`);
    const { listeners } = await session.send("DOMDebugger.getEventListeners", { objectId: result.objectId });
    return listeners.map((l) => l.type);
  } finally {
    await session.detach();
  }
}

/** Le texte d'un élément, espaces normalisés (null s'il n'existe pas). */
export function texteDe(page, selecteur) {
  return page.$eval(selecteur, (e) => (e.textContent ?? "").replace(/\s+/g, " ").trim()).catch(() => null);
}

/** Vrai si l'élément est rendu à l'écran (ni hidden, ni display: none, ni dans un parent caché). */
export function estVisible(page, selecteur) {
  return page.$eval(selecteur, (e) => e.checkVisibility()).catch(() => false);
}
