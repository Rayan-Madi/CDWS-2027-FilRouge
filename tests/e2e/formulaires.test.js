// TP 1, points 4 et 5 : la validation au fil de la saisie, puis l'envoi.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrerServeur } from "../outils/serveur.js";
import { ouvrirNavigateur, nouvellePage, elementActif, texteDe } from "../outils/navigateur.js";

let serveur, navigateur;
before(async () => {
  serveur = await demarrerServeur();
  navigateur = await ouvrirNavigateur();
});
after(async () => {
  await navigateur?.close();
  await serveur?.arreter();
});

const envoyer = (page) => page.click("#form-inscription button[type=submit]");
const erreurDe = (page, id) => texteDe(page, `#erreur-${id}`);

async function remplir(page, { nom = "Jonny Martin", courriel = "jonny@exemple.fr", profil = "apprenant", cgu = true } = {}) {
  await page.$eval("#nom", (c, v) => (c.value = v), nom);
  await page.$eval("#courriel", (c, v) => (c.value = v), courriel);
  await page.select("#profil", profil);
  if (cgu) await page.$eval("#cgu", (c) => (c.checked = true));
}

test("envoi vide : un message à côté de chaque champ, relié par aria-describedby, focus sur le premier", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await envoyer(page);
  assert.equal(await erreurDe(page, "nom"), "Indiquez votre prénom et votre nom.");
  assert.equal(await erreurDe(page, "courriel"), "Indiquez votre adresse électronique.");
  assert.equal(await erreurDe(page, "profil"), "Choisissez votre profil.");
  assert.equal(await erreurDe(page, "cgu"), "Vous devez accepter les conditions pour continuer.");
  assert.match(await elementActif(page), /^input#nom/);
  for (const id of ["nom", "courriel", "profil", "cgu"]) {
    assert.equal(await page.$eval(`#${id}`, (c) => c.getAttribute("aria-invalid")), "true", id);
    assert.ok((await page.$eval(`#${id}`, (c) => c.getAttribute("aria-describedby"))).includes(`erreur-${id}`), id);
  }
  await page.close();
});

test("nos règles après le natif : un nom d'espaces et « a@b » sont refusés", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await page.type("#nom", "   ");
  await page.type("#courriel", "a@b");
  await page.focus("#profil"); // on quitte le champ : l'erreur apparaît
  assert.equal(await erreurDe(page, "nom"), "Indiquez votre prénom et votre nom.");
  assert.equal(await erreurDe(page, "courriel"), "L'adresse doit ressembler à nom@exemple.fr.");
  // Le navigateur seul les aurait acceptés
  assert.equal(await page.$eval("#nom", (c) => (c.setCustomValidity(""), c.checkValidity())), true);
  assert.equal(await page.$eval("#courriel", (c) => (c.setCustomValidity(""), c.checkValidity())), true);
  await page.close();
});

test("aider, pas punir : l'erreur disparaît dès que la saisie devient valide", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await page.type("#courriel", "jonny@exemple");
  await page.focus("#nom");
  assert.equal(await erreurDe(page, "courriel"), "L'adresse doit ressembler à nom@exemple.fr.");
  await page.focus("#courriel");
  await page.type("#courriel", ".fr");
  assert.equal(await erreurDe(page, "courriel"), "", "corrigé pendant la frappe, sans quitter le champ");
  assert.equal(await page.$eval("#courriel", (c) => c.getAttribute("aria-invalid")), "false");
  await page.close();
});

test("envoi valide : bouton désactivé, « Inscription en cours… », puis la confirmation", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await remplir(page);
  await envoyer(page);
  const bouton = "#form-inscription button[type=submit]";
  assert.equal(await page.$eval(bouton, (b) => b.disabled), true);
  assert.equal(await texteDe(page, bouton), "Inscription en cours…");
  await page.waitForFunction(() => document.querySelector("#form-inscription .formulaire__confirmation").textContent !== "");
  assert.equal(
    await texteDe(page, "#form-inscription .formulaire__confirmation"),
    "Merci Jonny, votre compte est prêt. Choisissez maintenant un atelier ci-dessus et touchez « Réserver »."
  );
  assert.equal(await page.$eval(bouton, (b) => b.disabled), false);
  assert.equal(await texteDe(page, bouton), "Créer mon compte");
  assert.equal(await page.$eval("#nom", (c) => c.value), "", "formulaire vidé");
  assert.equal(new URL(page.url()).hash, "", "pas de rechargement ni de navigation");
  await page.close();
});

test("la même adresse une seconde fois : le refus du serveur est annoncé (role=alert)", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await remplir(page);
  await envoyer(page);
  await page.waitForFunction(() => document.querySelector("#form-inscription .formulaire__confirmation").textContent !== "");
  await remplir(page);
  await envoyer(page);
  await page.waitForFunction(() => document.querySelector("#form-inscription .formulaire__erreur").textContent !== "");
  assert.equal(await page.$eval("#form-inscription .formulaire__erreur", (e) => e.getAttribute("role")), "alert");
  assert.equal(await texteDe(page, "#form-inscription .formulaire__erreur"), "Un compte existe déjà avec cette adresse. Vérifiez-la, ou utilisez-en une autre.");
  assert.equal(await texteDe(page, "#form-inscription .formulaire__confirmation"), "");
  assert.equal(await page.$eval("#form-inscription button[type=submit]", (b) => b.disabled), false, "le bouton est rendu");
  await page.close();
});

test("le lien « Créez votre compte » des formateurs choisit déjà le profil", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await page.click("a[data-profil]");
  assert.equal(await page.$eval("#profil", (s) => s.value), "formateur");
  await page.close();
});
