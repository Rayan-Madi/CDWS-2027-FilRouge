// TP 3 : le catalogue chargé, filtrable, et ses quatre états — pannes provoquées comprises.
import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { demarrerServeur } from "../outils/serveur.js";
import { ouvrirNavigateur, nouvellePage, elementActif, texteDe, estVisible } from "../outils/navigateur.js";

const JSON_ATELIERS = "/donnees/ateliers.json";
const ateliers = JSON.parse(fs.readFileSync(new URL("../../src/donnees/ateliers.json", import.meta.url), "utf8"));

let serveur, navigateur;
before(async () => {
  serveur = await demarrerServeur();
  navigateur = await ouvrirNavigateur();
});
after(async () => {
  await navigateur?.close();
  await serveur?.arreter();
});
afterEach(() => serveur.pannes.clear());

const statut = (page) => texteDe(page, ".catalogue__statut");
const chargementFini = (page) => page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");
const titresAffiches = (page) => page.$$eval(".ateliers > li h3", (h) => h.map((e) => e.textContent));
const prixAffiches = (page) =>
  page.$$eval(".ateliers .atelier__prix", (p) => p.map((e) => (e.textContent === "Gratuit" ? 0 : Number.parseInt(e.textContent, 10))));
/** Attend que le compteur change, et rend son nouveau texte. */
async function statutApres(page, action) {
  const avant = await statut(page);
  await action();
  await page.waitForFunction((t) => document.querySelector(".catalogue__statut").textContent !== t, {}, avant);
  return statut(page);
}

test("succès : les quatorze ateliers du JSON, et le compteur annoncé", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await chargementFini(page);
  assert.equal((await titresAffiches(page)).length, ateliers.length);
  assert.equal(await statut(page), `${ateliers.length} ateliers · par date`);
  assert.equal(await page.$eval(".catalogue__statut", (e) => e.getAttribute("role")), "status");
  assert.equal(await estVisible(page, ".filtres"), true);
  assert.equal((await titresAffiches(page))[0], "Initiation à Git", "le plus proche d'abord");
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("chargement lent : cartes fantômes à la place des vraies, aria-busy, puis le succès", async () => {
  serveur.pannes.set(JSON_ATELIERS, { delai: 1500 });
  const page = await nouvellePage(navigateur, serveur.url, { attendre: false });
  await page.waitForSelector(".atelier-fantome");
  assert.equal(await page.$eval(".ateliers", (l) => l.getAttribute("aria-busy")), "true");
  assert.equal(await statut(page), "Chargement des ateliers…");
  assert.equal(await page.$$eval(".atelier-fantome", (f) => f.every((e) => e.getAttribute("aria-hidden") === "true")), true);
  const hauteur = await page.$eval(".atelier-fantome", (f) => f.getBoundingClientRect().height);
  assert.ok(hauteur >= 300, `une place réservée à la taille d'une carte (${hauteur} px)`);
  await chargementFini(page);
  assert.equal(await page.$$eval(".atelier-fantome", (f) => f.length), 0);
  assert.equal(await statut(page), `${ateliers.length} ateliers · par date`);
  await page.close();
});

test("404 (fichier introuvable) : une phrase et « Réessayer », jamais le code ; rien ne reste bloqué", async () => {
  serveur.pannes.set(JSON_ATELIERS, { statut: 404 });
  const page = await nouvellePage(navigateur, serveur.url);
  await page.waitForSelector(".catalogue__panne");
  assert.equal(
    await texteDe(page, '.catalogue__panne [role="alert"]'),
    "Impossible de charger les ateliers. Le catalogue est introuvable pour le moment. Réessayez dans un instant."
  );
  assert.ok(!(await texteDe(page, ".catalogue__panne")).includes("404"), "le code ne s'affiche pas");
  assert.ok(page.erreurs.some((e) => e.includes("catalogue non chargé (http 404)")), "le code part dans la console");
  assert.equal(await page.$eval(".ateliers", (l) => l.getAttribute("aria-busy")), "false", "l'indicateur est retiré");
  assert.equal(await page.$$eval(".atelier-fantome", (f) => f.length), 0);
  assert.equal(await statut(page), "");

  // « Réessayer » : le focus va au titre (le bouton disparaît), et le catalogue revient
  serveur.pannes.delete(JSON_ATELIERS);
  await page.click("[data-reessayer]");
  assert.match(await elementActif(page), /^h2#t-ateliers/);
  await chargementFini(page);
  assert.equal(await statut(page), `${ateliers.length} ateliers · par date`);
  assert.equal(await page.$(".catalogue__panne"), null);
  await page.close();
});

test("500 : « le serveur rencontre un problème »", async () => {
  serveur.pannes.set(JSON_ATELIERS, { statut: 500 });
  const page = await nouvellePage(navigateur, serveur.url);
  await page.waitForSelector(".catalogue__panne");
  assert.match(await texteDe(page, '.catalogue__panne [role="alert"]'), /Le serveur rencontre un problème/);
  await page.close();
});

test("hors ligne (comme la case Offline de l'onglet Réseau) : « la connexion semble coupée », puis retour", async () => {
  serveur.pannes.set(JSON_ATELIERS, { statut: 503 });
  const page = await nouvellePage(navigateur, serveur.url);
  await page.waitForSelector(".catalogue__panne");
  serveur.pannes.clear();
  await page.setOfflineMode(true);
  await page.click("[data-reessayer]");
  await page.waitForFunction(() => document.querySelector('.catalogue__panne [role="alert"]')?.textContent.includes("connexion"));
  assert.equal(
    await texteDe(page, '.catalogue__panne [role="alert"]'),
    "Impossible de charger les ateliers. La connexion semble coupée. Vérifiez votre réseau, puis réessayez."
  );
  assert.equal(await page.$eval(".ateliers", (l) => l.getAttribute("aria-busy")), "false");
  assert.equal(await page.$$eval(".atelier-fantome", (f) => f.length), 0);

  await page.setOfflineMode(false);
  await page.click("[data-reessayer]");
  await chargementFini(page);
  await page.waitForFunction(() => document.querySelectorAll(".ateliers > li").length > 3);
  assert.equal(await statut(page), `${ateliers.length} ateliers · par date`);
  await page.close();
});

test("la recherche ignore les accents, et attend la fin de la frappe : un seul changement du compteur", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await chargementFini(page);
  await page.evaluate(() => {
    window.annonces = [];
    new MutationObserver(() => window.annonces.push(document.querySelector(".catalogue__statut").textContent)).observe(
      document.querySelector(".catalogue__statut"),
      { childList: true, characterData: true, subtree: true }
    );
  });
  await page.type("#recherche", "accessibilite", { delay: 40 });
  await page.waitForFunction(() => window.annonces.length > 0);
  await new Promise((fin) => setTimeout(fin, 400));
  assert.deepEqual(await page.evaluate(() => window.annonces), ["1 atelier · « accessibilite » · par date"], "13 frappes, une annonce");
  assert.deepEqual(await titresAffiches(page), ["Accessibilité numérique : rendre un formulaire utilisable au clavier et au lecteur d'écran"]);
  await page.close();
});

test("Entrée dans la recherche applique tout de suite, sans recharger la page", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await chargementFini(page);
  await page.evaluate(() => {
    window.sansRechargement = true; // un rechargement ou un envoi du formulaire l'effacerait
  });
  await page.focus("#recherche");
  await page.keyboard.type("figma");
  await page.keyboard.press("Enter");
  assert.equal(await statut(page), "2 ateliers · « figma » · par date", "sans attendre les 300 ms");
  await new Promise((fin) => setTimeout(fin, 500)); // le temps qu'une navigation, s'il y en avait une, ait lieu
  assert.equal(await page.evaluate(() => window.sansRechargement), true, "pas de rechargement");
  assert.equal(new URL(page.url()).search, "", "pas d'envoi du formulaire");
  await page.close();
});

test("niveau, tri par prix et « le soir » : chaque changement change le compteur", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await chargementFini(page);
  const avances = ateliers.filter((a) => a.niveau === "avance").length;
  assert.equal(await statutApres(page, () => page.select("#niveau", "avance")), `${avances} ateliers · niveau avancé · par date`);
  await page.select("#niveau", "tous");

  assert.match(await statutApres(page, () => page.select("#tri", "prix-croissant")), /par prix croissant$/);
  const croissant = await prixAffiches(page);
  assert.deepEqual(croissant, [...croissant].sort((a, b) => a - b));
  await page.select("#tri", "prix-decroissant");
  const decroissant = await prixAffiches(page);
  assert.deepEqual(decroissant, [...decroissant].sort((a, b) => b - a));

  assert.match(await statutApres(page, () => page.click("#soir")), / · le soir · par prix décroissant$/);
  const soir = await page.$$eval(".ateliers time", (t) => t.map((e) => e.textContent));
  assert.ok(soir.every((t) => /, (1[89]|2\d)\s?h/.test(t)), `que des ateliers du soir : ${soir}`);
  await page.close();
});

test("vide : une phrase polie et « Tout afficher », qui remet tout et renvoie le focus à la recherche", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await chargementFini(page);
  await page.select("#niveau", "avance");
  await page.type("#recherche", "portfolio");
  await page.waitForFunction(() => document.querySelector(".catalogue__statut").textContent.startsWith("Aucun"));
  assert.equal(await statut(page), "Aucun atelier ne correspond à ces filtres.");
  assert.equal(await estVisible(page, ".ateliers__vide"), true);
  assert.equal(await page.$$eval(".ateliers > li", (l) => l.length), 0);
  assert.equal(await page.$(".catalogue__panne"), null, "le vide n'est pas une panne");

  await page.click("[data-tout-afficher]");
  assert.match(await elementActif(page), /^input#recherche/);
  assert.equal(await page.$eval("#recherche", (c) => c.value), "");
  assert.equal(await page.$eval("#niveau", (c) => c.value), "tous");
  assert.equal(await statut(page), `${ateliers.length} ateliers · par date`);
  assert.equal(await estVisible(page, ".ateliers__vide"), false);
  await page.close();
});

test("taper pendant le chargement : la frappe n'est pas effacée quand le catalogue arrive", async () => {
  serveur.pannes.set(JSON_ATELIERS, { delai: 900 });
  const page = await nouvellePage(navigateur, serveur.url, { attendre: false });
  await page.waitForSelector(".atelier-fantome");
  await page.click("#recherche");
  await page.keyboard.type("fig", { delay: 30 });
  await chargementFini(page); // le catalogue arrive au milieu du mot
  await page.keyboard.type("ma", { delay: 30 });
  assert.equal(await page.$eval("#recherche", (c) => c.value), "figma");
  await page.waitForFunction(() => document.querySelector(".catalogue__statut").textContent.includes("figma"));
  assert.equal(await statut(page), "2 ateliers · « figma » · par date");
  await page.close();
});

test("changer le niveau juste après avoir tapé : le mot part avec, une seule annonce", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await chargementFini(page);
  await page.type("#recherche", "git");
  await page.evaluate(() => {
    window.annonces = [];
    new MutationObserver(() => window.annonces.push(document.querySelector(".catalogue__statut").textContent)).observe(
      document.querySelector(".catalogue__statut"),
      { childList: true, characterData: true, subtree: true }
    );
  });
  await page.select("#niveau", "debutant"); // moins de 300 ms après la dernière lettre
  assert.equal(await page.$eval("#recherche", (c) => c.value), "git", "le champ n'est pas vidé");
  await new Promise((fin) => setTimeout(fin, 450));
  assert.deepEqual(await page.evaluate(() => window.annonces), ["1 atelier · « git » · niveau débutant · par date"]);
  await page.close();
});

test("en panne, changer un filtre ne réannonce pas l'alerte (elle interrompt)", async () => {
  serveur.pannes.set(JSON_ATELIERS, { statut: 500 });
  const page = await nouvellePage(navigateur, serveur.url);
  await page.waitForSelector(".catalogue__panne");
  await page.evaluate(() => {
    window.alertesInserees = 0;
    new MutationObserver((mutations) => {
      for (const m of mutations) for (const n of m.addedNodes) if (n instanceof Element && n.querySelector('[role="alert"]')) window.alertesInserees += 1;
    }).observe(document.querySelector(".catalogue__erreur"), { childList: true });
  });
  await page.select("#niveau", "avance");
  await page.click("#soir");
  await page.type("#recherche", "git");
  await new Promise((fin) => setTimeout(fin, 450));
  assert.equal(await page.evaluate(() => window.alertesInserees), 0);
  assert.equal(await page.$$eval('.catalogue__panne [role="alert"]', (a) => a.length), 1, "l'alerte est toujours là");
  await page.close();
});

test("les raccourcis du sous-menu règlent le catalogue", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 1280 });
  await chargementFini(page);
  await page.click(".navigation__deplier");
  await page.click('[data-raccourci="debutant"]');
  assert.equal(await page.$eval("#niveau", (c) => c.value), "debutant");
  assert.match(await statut(page), /niveau débutant/);
  await page.click(".navigation__deplier");
  await page.click('[data-raccourci="soir"]');
  assert.equal(await page.$eval("#niveau", (c) => c.value), "tous", "un raccourci remplace les critères");
  assert.equal(await page.$eval("#soir", (c) => c.checked), true);
  await page.click(".navigation__deplier");
  await page.click('[data-raccourci="tous"]');
  assert.equal(await statut(page), `${ateliers.length} ateliers · par date`);
  await page.close();
});

test("sans JavaScript : les trois ateliers écrits dans la page, et pas de filtre", async () => {
  const page = await navigateur.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto(serveur.url);
  assert.deepEqual(await titresAffiches(page), ["Initiation à Git", "Maquetter une page avec Figma", "Construire son portfolio"]);
  assert.equal(await estVisible(page, ".filtres"), false);
  assert.equal(await page.$eval(".ateliers a.action", (a) => a.getAttribute("href")), "#inscription");
  await page.close();
});
