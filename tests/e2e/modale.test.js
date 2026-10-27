// La modale de réservation et le filtre FM02, réécrits en TP 1.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrerServeur } from "../outils/serveur.js";
import { ouvrirNavigateur, nouvellePage, elementActif, texteDe, ecouteurs } from "../outils/navigateur.js";

let serveur, navigateur;
before(async () => {
  serveur = await demarrerServeur();
  navigateur = await ouvrirNavigateur();
});
after(async () => {
  await navigateur?.close();
  await serveur?.arreter();
});

const modaleOuverte = (page) => page.$eval("#modale-reservation", (d) => d.open);
const premierReserver = ".ateliers [data-reserver]";

test("au clavier : « Réserver » ouvre la modale, Échap la ferme, le focus revient au bouton", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  assert.equal(await page.$eval(premierReserver, (b) => b.tagName), "BUTTON", "le lien est devenu un bouton");
  await page.focus(premierReserver);
  await page.keyboard.press("Enter");
  assert.equal(await modaleOuverte(page), true);
  assert.equal(await texteDe(page, ".modale__atelier"), "Initiation à Git");
  assert.match(await elementActif(page), /^input#r-nom/, "le focus est entré dans la modale");
  await page.keyboard.press("Escape");
  assert.equal(await modaleOuverte(page), false);
  assert.match(await elementActif(page), /^button.action "Réserver l'atelier Initiation à Git"/);
  await page.close();
});

test("réserver : « Réservation en cours… », puis la confirmation, et « Fermer » rend le focus", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await page.click(premierReserver);
  await page.type("#r-nom", "Jonny Martin");
  await page.type("#r-courriel", "jonny@exemple.fr");
  await page.click("#form-reservation button[value=reserver]");
  assert.equal(await texteDe(page, "#form-reservation button[value=reserver]"), "Réservation en cours…");
  await page.waitForFunction(() => document.querySelector("#form-reservation .formulaire__confirmation").textContent !== "");
  assert.equal(
    await texteDe(page, "#form-reservation .formulaire__confirmation"),
    "C'est réservé, Jonny ! Initiation à Git : Niveau débutant · 3 h · en ligne · mercredi 7 octobre, 18 h 30 · 25 €. Le lien de l'atelier arrivera à jonny@exemple.fr la veille."
  );
  assert.match(await elementActif(page), /^button.action "Fermer"/);
  await page.keyboard.press("Enter");
  assert.equal(await modaleOuverte(page), false);
  assert.match(await elementActif(page), /"Réserver l'atelier Initiation à Git"/);
  await page.close();
});

test("le même atelier, la même adresse : la seconde réservation est refusée", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  for (let essai = 0; essai < 2; essai += 1) {
    await page.click(premierReserver);
    await page.type("#r-nom", "Jonny Martin");
    await page.type("#r-courriel", "jonny@exemple.fr");
    await page.click("#form-reservation button[value=reserver]");
    await page.waitForFunction(
      () => document.querySelector("#form-reservation .formulaire__confirmation").textContent !== "" || document.querySelector("#form-reservation .formulaire__erreur").textContent !== ""
    );
    if (essai === 0) await page.click("#form-reservation button[value=fermer]");
  }
  assert.equal(await texteDe(page, "#form-reservation .formulaire__erreur"), "Vous avez déjà réservé cet atelier avec cette adresse.");
  assert.equal(await modaleOuverte(page), true, "la modale reste ouverte");
  await page.close();
});

test("annuler ne valide rien et ferme ; un clic sur le fond ferme aussi", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await page.click(premierReserver);
  await page.click("#form-reservation button[value=annuler]");
  assert.equal(await modaleOuverte(page), false);
  await page.click(premierReserver);
  await page.mouse.click(5, 5);
  assert.equal(await modaleOuverte(page), false);
  await page.close();
});

test("les boutons « Réserver » n'ont pas d'écouteur : un seul, délégué, sur la liste", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  assert.deepEqual(await ecouteurs(page, premierReserver), []);
  assert.deepEqual(await ecouteurs(page, ".ateliers"), ["click"]);
  await page.close();
});

test("le filtre FM02 : son état ne vit plus dans les cases, le compteur et le message vide suivent", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  assert.equal(await texteDe(page, ".filtres__resultat"), "3 ateliers affichés");
  await page.click(".filtres [name=soir]");
  assert.equal(await texteDe(page, ".filtres__resultat"), "2 ateliers affichés");
  const visibles = () => page.$$eval(".ateliers > li", (lis) => lis.filter((li) => !li.hidden).map((li) => li.querySelector("h3").textContent));
  assert.deepEqual(await visibles(), ["Initiation à Git", "Construire son portfolio"]);
  await page.click(".filtres [name=soir]");
  await page.click(".filtres [name=debutant]");
  assert.deepEqual(await visibles(), ["Initiation à Git", "Construire son portfolio"], "l'intermédiaire est écarté");
  await page.click(".filtres [name=debutant]");
  assert.equal(await texteDe(page, ".filtres__resultat"), "3 ateliers affichés");
  assert.equal(await page.$eval(".ateliers__vide", (p) => p.hidden), true);
  await page.close();
});
