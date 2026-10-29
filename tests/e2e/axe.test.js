// axe-core (le moteur de Lighthouse Accessibilité) sur chacun des quatre états du catalogue, et la fiche ouverte.
import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { demarrerServeur } from "../outils/serveur.js";
import { ouvrirNavigateur, nouvellePage } from "../outils/navigateur.js";

const cheminAxe = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const JSON_ATELIERS = "/donnees/ateliers.json";

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

/** Les violations WCAG 2.2 A et AA, en une ligne chacune (« règle : élément »). */
async function violations(page) {
  await page.addScriptTag({ path: cheminAxe });
  return page.evaluate(async () => {
    const { violations } = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    });
    return violations.flatMap((v) => v.nodes.map((n) => `${v.id} : ${n.target.join(" ")}`));
  });
}

const pret = (page) => page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");

test("succès, à 375 et 1280 px : aucune violation", async () => {
  for (const largeur of [375, 1280]) {
    const page = await nouvellePage(navigateur, serveur.url, { largeur });
    await pret(page);
    assert.deepEqual(await violations(page), [], `à ${largeur} px`);
    await page.close();
  }
});

test("chargement : aucune violation", async () => {
  serveur.pannes.set(JSON_ATELIERS, { delai: 4000 });
  const page = await nouvellePage(navigateur, serveur.url, { attendre: false });
  await page.waitForSelector(".atelier-fantome");
  assert.deepEqual(await violations(page), []);
  await page.close();
});

test("erreur : aucune violation", async () => {
  serveur.pannes.set(JSON_ATELIERS, { statut: 404 });
  const page = await nouvellePage(navigateur, serveur.url);
  await page.waitForSelector(".catalogue__panne");
  assert.deepEqual(await violations(page), []);
  await page.close();
});

test("vide : aucune violation", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.type("#recherche", "cobol");
  await page.waitForFunction(() => document.querySelector(".catalogue__statut").textContent.startsWith("Aucun"));
  assert.deepEqual(await violations(page), []);
  await page.close();
});

test("la fiche ouverte, menu et sous-menu ouverts : aucune violation", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375 });
  await pret(page);
  await page.click(".menu-bouton");
  await page.click(".navigation__deplier");
  assert.deepEqual(await violations(page), [], "menu ouvert");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.click('[data-reserver="git-initiation"]');
  assert.deepEqual(await violations(page), [], "fiche ouverte");
  await page.close();
});
