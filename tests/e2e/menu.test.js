// TP 1, point 2 : le menu réécrit en délégation, avec un sous-menu.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { demarrerServeur, RACINE_SRC } from "../outils/serveur.js";
import { ouvrirNavigateur, nouvellePage, elementActif, ecouteurs, estVisible } from "../outils/navigateur.js";

let serveur, navigateur;
before(async () => {
  serveur = await demarrerServeur();
  navigateur = await ouvrirNavigateur();
});
after(async () => {
  await navigateur?.close();
  await serveur?.arreter();
});

const attribut = (page, selecteur, nom) => page.$eval(selecteur, (e, n) => e.getAttribute(n), nom);

test("téléphone : « Menu » ouvre et referme, aria-expanded suit", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");
  assert.equal(await estVisible(page, "#menu"), false);

  await page.click(".menu-bouton");
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "true");
  assert.equal(await estVisible(page, "#menu"), true);

  await page.click(".menu-bouton");
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");
  assert.equal(await estVisible(page, "#menu"), false);
  await page.close();
});

test("téléphone : un lien choisi, Échap ou un clic dehors referment le menu", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });

  await page.click(".menu-bouton");
  await page.click('#menu a[href="#valeurs"]');
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");

  await page.click(".menu-bouton");
  await page.focus('#menu a[href="#formateurs"]');
  await page.keyboard.press("Escape");
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");
  assert.match(await elementActif(page), /^button\.menu-bouton/, "le focus revient à « Menu »");

  await page.click(".menu-bouton");
  await page.mouse.click(180, 700); // dans la page, hors de la navigation
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");
  await page.close();
});

test("le sous-menu « Ateliers » s'ouvre, et Échap le referme avant le menu", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });
  await page.click(".menu-bouton");
  assert.equal(await estVisible(page, "#sous-menu-ateliers"), false);

  await page.click(".navigation__deplier");
  assert.equal(await attribut(page, ".navigation__deplier", "aria-expanded"), "true");
  assert.equal(await estVisible(page, "#sous-menu-ateliers"), true);

  await page.focus('#sous-menu-ateliers a[data-raccourci="soir"]');
  await page.keyboard.press("Escape");
  assert.equal(await attribut(page, ".navigation__deplier", "aria-expanded"), "false");
  assert.equal(await estVisible(page, "#sous-menu-ateliers"), false);
  assert.match(await elementActif(page), /^button\.navigation__deplier/);
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "true", "le menu reste ouvert");

  await page.keyboard.press("Escape");
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");
  assert.match(await elementActif(page), /^button\.menu-bouton/);
  await page.close();
});

test("ordinateur : le sous-menu se déroule sous « Ateliers » et se ferme quand le focus le quitte", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 1280 });
  assert.equal(await estVisible(page, ".menu-bouton"), false);
  assert.equal(await estVisible(page, ".navigation__deplier"), true);

  await page.focus(".navigation__deplier");
  await page.keyboard.press("Enter");
  assert.equal(await estVisible(page, "#sous-menu-ateliers"), true);

  await page.keyboard.press("Tab");
  assert.match(await elementActif(page), /"Tout le catalogue"/);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  assert.match(await elementActif(page), /"Le soir"/);
  await page.keyboard.press("Tab");
  assert.match(await elementActif(page), /"Formateurs"/);
  assert.equal(await estVisible(page, "#sous-menu-ateliers"), false, "le sous-menu s'est refermé");
  assert.equal(await attribut(page, ".navigation__deplier", "aria-expanded"), "false");

  await page.click(".navigation__deplier");
  await page.mouse.click(640, 600);
  assert.equal(await estVisible(page, "#sous-menu-ateliers"), false, "un clic dehors le referme");
  await page.close();
});

test("un raccourci du sous-menu règle le filtre des ateliers et referme tout", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });
  await page.click(".menu-bouton");
  await page.click(".navigation__deplier");
  await page.click('#sous-menu-ateliers a[data-raccourci="soir"]');
  assert.equal(await page.$eval(".filtres [name=soir]", (c) => c.checked), true);
  assert.equal(await attribut(page, ".menu-bouton", "aria-expanded"), "false");
  assert.equal(await attribut(page, ".navigation__deplier", "aria-expanded"), "false");
  assert.equal(new URL(page.url()).hash, "#ateliers");
  await page.close();
});

test("délégation : un seul écouteur de clic, sur la nav ; aucun sur ses boutons", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });
  const surNav = await ecouteurs(page, ".navigation");
  assert.equal(surNav.filter((t) => t === "click").length, 1, `écouteurs de la nav : ${surNav}`);
  assert.deepEqual(await ecouteurs(page, ".menu-bouton"), []);
  assert.deepEqual(await ecouteurs(page, ".navigation__deplier"), []);
  await page.close();
});

test("les écouteurs du document n'existent que tant qu'un panneau est ouvert", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });
  const surDocument = async () => (await ecouteurs(page, "document")).filter((t) => t === "keydown" || t === "click");
  assert.deepEqual(await surDocument(), [], "menu fermé : rien sur le document");
  await page.click(".menu-bouton");
  assert.deepEqual((await surDocument()).sort(), ["click", "keydown"]);
  await page.click(".menu-bouton");
  assert.deepEqual(await surDocument(), [], "refermé : retirés d'un seul abort()");
  await page.close();
});

test("aria-current suit la section visible, et disparaît quand on remonte à l'accroche", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 1280, hauteur: 800 });
  await page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");
  const courant = () => page.$$eval(".navigation__liste [aria-current]", (l) => l.map((a) => a.textContent.trim()));
  await page.evaluate(() => document.querySelector("#valeurs").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector('.navigation__liste a[href="#valeurs"]').hasAttribute("aria-current"));
  assert.deepEqual(await courant(), ["Valeurs"]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(() => !document.querySelector(".navigation__liste [aria-current]"));
  assert.deepEqual(await courant(), [], "en haut de page, aucun lien n'est « la page actuelle »");
  assert.deepEqual(await page.$$eval("#sous-menu-ateliers [aria-current]", (l) => l.length), 0, "jamais les raccourcis");
  await page.close();
});

test("aria-current : un cran de molette vers le bas puis vers le haut, et plus rien n'est marqué", async () => {
  // L'accroche reste dans la bande du milieu pendant que « Valeurs » y entre puis en sort : seul le
  // suivi de TOUTES les sections présentes dans la bande retire la marque au retour
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 1280, hauteur: 900 });
  await page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");
  const marque = () => page.$$eval(".navigation__liste [aria-current]", (l) => l.map((a) => a.textContent.trim()));
  await page.mouse.move(640, 600);
  await page.mouse.wheel({ deltaY: 100 });
  await page.waitForFunction(() => window.scrollY >= 100 && document.querySelector('.navigation__liste a[href="#valeurs"]').hasAttribute("aria-current"));
  assert.deepEqual(await marque(), ["Valeurs"]);
  await page.mouse.wheel({ deltaY: -100 });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));
  assert.deepEqual(await marque(), [], "revenu en haut : plus aucun lien marqué");
  await page.close();
});

test("ouverte en file://, où les modules ne se chargent pas, la page garde son menu déplié", async () => {
  const fichier = pathToFileURL(path.join(RACINE_SRC, "index.html")).href;
  const page = await nouvellePage(navigateur, fichier, { largeur: 375 });
  assert.equal(await page.$eval("html", (h) => h.classList.contains("js")), false, "classe js retirée");
  assert.equal(await estVisible(page, "#menu"), true);
  assert.equal(await estVisible(page, ".menu-bouton"), false);
  assert.equal(await estVisible(page, ".navigation__deplier"), false);
  await page.close();
});
