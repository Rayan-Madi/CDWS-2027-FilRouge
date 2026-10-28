// Fumée : la page se charge sans erreur, et le JavaScript se signale (classe js).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrerServeur } from "../outils/serveur.js";
import { ouvrirNavigateur, nouvellePage } from "../outils/navigateur.js";

let serveur, navigateur;
before(async () => {
  serveur = await demarrerServeur();
  navigateur = await ouvrirNavigateur();
});
after(async () => {
  await navigateur?.close();
  await serveur?.arreter();
});

// La page n'est « finie » qu'une fois le catalogue rendu : ses 14 cartes changent la hauteur de la page
const catalogueRendu = (page) =>
  page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false" && document.querySelectorAll(".ateliers > li").length > 3);

test("la page se charge sans erreur dans la console", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await catalogueRendu(page);
  assert.equal(await page.title(), "SkillHub – apprendre avec un formateur indépendant");
  assert.ok(await page.$eval("html", (h) => h.classList.contains("js")), "classe js absente");
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("aucun débordement horizontal à 375, 800 et 1280 px", async () => {
  for (const largeur of [375, 800, 1280]) {
    const page = await nouvellePage(navigateur, serveur.url, { largeur });
    await catalogueRendu(page);
    const deborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(deborde, false, `débordement à ${largeur} px`);
    await page.close();
  }
});
