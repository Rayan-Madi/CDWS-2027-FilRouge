// La fiche d'un atelier et sa réservation, dans le <dialog> ; le retour du focus à la carte.
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
const reserverGit = '[data-reserver="git-initiation"]';
const pret = (page) => page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");

async function reserver(page, { nom = "Jonny Martin", courriel = "jonny@exemple.fr" } = {}) {
  await page.type("#r-nom", nom);
  await page.type("#r-courriel", courriel);
  await page.click("#form-reservation button[value=reserver]");
  await page.waitForFunction(
    () => (document.querySelector("#form-reservation .formulaire__confirmation").textContent !== "" && !document.querySelector("#form-reservation .formulaire__confirmation").hasAttribute("data-en-cours")) || document.querySelector("#form-reservation .formulaire__erreur").textContent !== ""
  );
}

test("au clavier : « Réserver » ouvre la fiche, Échap la ferme, le focus revient au même bouton", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.focus(reserverGit);
  await page.keyboard.press("Enter");
  assert.equal(await modaleOuverte(page), true);
  assert.equal(await texteDe(page, ".modale__atelier"), "Initiation à Git");
  assert.equal(await texteDe(page, ".modale__recap"), "Niveau débutant · 3 h · en ligne · mercredi 4 novembre, 18 h 30 · 25 €");
  assert.equal(await texteDe(page, ".modale__formateur"), "Sarah Benali");
  assert.equal(await texteDe(page, ".modale__prerequis"), "Aucun : venez avec un ordinateur.");
  assert.equal(await texteDe(page, ".modale__places"), "6 places");
  assert.match(await elementActif(page), /^input#r-nom/, "le focus est entré dans la modale");
  await page.keyboard.press("Escape");
  assert.equal(await modaleOuverte(page), false);
  assert.match(await elementActif(page), /^button\.action "Réserver l'atelier Initiation à Git"/);
  await page.close();
});

test("réserver : « Réservation en cours… », la confirmation, une place de moins sur la carte", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  await page.type("#r-nom", "Jonny Martin");
  await page.type("#r-courriel", "jonny@exemple.fr");
  await page.click("#form-reservation button[value=reserver]");
  assert.equal(await texteDe(page, "#form-reservation button[value=reserver]"), "Réservation en cours…");
  await page.waitForFunction(() => (document.querySelector("#form-reservation .formulaire__confirmation").textContent !== "" && !document.querySelector("#form-reservation .formulaire__confirmation").hasAttribute("data-en-cours")));
  assert.equal(
    await texteDe(page, "#form-reservation .formulaire__confirmation"),
    "C'est réservé, Jonny ! Initiation à Git : Niveau débutant · 3 h · en ligne · mercredi 4 novembre, 18 h 30 · 25 €. Le lien de connexion arrivera à jonny@exemple.fr la veille."
  );
  assert.match(await elementActif(page), /^button\.action "Fermer"/);
  assert.equal(await texteDe(page, '[data-id="git-initiation"] .atelier__places'), "5 places", "la carte a suivi l'état");
  await page.keyboard.press("Enter");
  assert.equal(await modaleOuverte(page), false);
  assert.match(await elementActif(page), /"Réserver l'atelier Initiation à Git"/, "la carte a été reconstruite, le focus la retrouve");
  await page.close();
});

test("pendant « Réservation en cours… » : ni Annuler, ni Échap, ni le fond ne ferment ; l'attente est annoncée", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  await page.type("#r-nom", "Jonny Martin");
  await page.type("#r-courriel", "jonny@exemple.fr");
  await page.click("#form-reservation button[value=reserver]");
  // L'attente est écrite dans la zone role="status" : un bouton désactivé, lui, n'est plus annoncé
  assert.equal(await texteDe(page, "#form-reservation .formulaire__confirmation"), "Réservation en cours…");
  assert.equal(await page.$eval("#form-reservation button[value=annuler]", (b) => b.disabled), true);
  await page.keyboard.press("Escape");
  assert.equal(await modaleOuverte(page), true, "Échap ne ferme pas pendant l'envoi");
  await page.mouse.click(5, 5);
  assert.equal(await modaleOuverte(page), true, "le fond ne ferme pas pendant l'envoi");
  await page.waitForFunction(() => document.querySelector("#form-reservation .formulaire__confirmation").textContent.startsWith("C'est réservé"));
  assert.match(await elementActif(page), /^button.action "Fermer"/, "la réponse est lue, le focus sur « Fermer »");
  assert.equal(await page.$eval("#form-reservation button[value=annuler]", (b) => b.disabled), false, "rendu après l'envoi");
  assert.equal(await texteDe(page, ".modale__places"), "5 places", "la fiche suit la place prise");
  await page.close();
});

test("une sélection de texte commencée dans un champ et relâchée sur le fond ne ferme pas la modale", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  await page.type("#r-nom", "Jonny Martin");
  const champ = await page.$eval("#r-nom", (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(champ.x, champ.y);
  await page.mouse.down();
  await page.mouse.move(5, 5, { steps: 5 });
  await page.mouse.up();
  assert.equal(await modaleOuverte(page), true);
  assert.equal(await page.$eval("#r-nom", (c) => c.value), "Jonny Martin", "rien n'est perdu");
  await page.close();
});

test("quitter un champ vide pour « Annuler » : un seul clic suffit, sans message qui pousse le bouton", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  await page.focus("#r-nom");
  await page.click("#form-reservation button[value=annuler]");
  assert.equal(await modaleOuverte(page), false);
  assert.equal(await texteDe(page, "#erreur-r-nom"), "", "aucune validation au départ vers Annuler");
  await page.close();
});

test("« Annuler » à la façon de Safari (le bouton cliqué ne prend pas le focus) : pas de validation non plus", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  // Safari : appui sur le bouton, puis le champ perd le focus SANS relatedTarget
  await page.evaluate(() => {
    const annuler = document.querySelector("#form-reservation button[value=annuler]");
    annuler.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    document.querySelector("#r-nom").blur();
  });
  assert.equal(await texteDe(page, "#erreur-r-nom"), "", "pas de message qui pousserait le bouton");
  // Le geste fini, un départ ordinaire du champ valide à nouveau
  await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })));
  await page.focus("#r-nom");
  await page.focus("#r-courriel");
  assert.equal(await texteDe(page, "#erreur-r-nom"), "Indiquez votre prénom et votre nom.");
  await page.close();
});

test("à Paris, la confirmation annonce l'adresse et non un lien", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click('[data-reserver="figma-maquette"]');
  await reserver(page, { nom: "Mélanie Dubois", courriel: "melanie@exemple.fr" });
  assert.match(await texteDe(page, "#form-reservation .formulaire__confirmation"), /L'adresse exacte, à Paris, arrivera à melanie@exemple\.fr la veille\.$/);
  await page.close();
});

test("la dernière place réservée : la carte passe à « Complet », et le focus se pose sur son titre", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  const carte = '[data-id="linkedin-reconversion"]';
  assert.equal(await texteDe(page, `${carte} .atelier__places`), "Plus qu'une place");
  await page.click(`${carte} [data-reserver]`);
  await reserver(page);
  await page.click("#form-reservation button[value=fermer]");
  assert.equal(await texteDe(page, `${carte} .atelier__places`), "Complet");
  assert.equal(await page.$eval(`${carte} button`, (b) => b.disabled), true);
  assert.match(await elementActif(page), /^h3#titre-linkedin-reconversion/);
  await page.close();
});

test("un atelier complet ne s'ouvre pas : son bouton est inerte et le dit", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  const bouton = '[data-id="accessibilite-formulaires"] button';
  assert.equal(await page.$eval(bouton, (b) => b.disabled), true);
  assert.match(await texteDe(page, bouton), /^Complet/);
  await page.close();
});

test("le même atelier, la même adresse : la seconde réservation est refusée (role=alert)", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  await reserver(page);
  await page.click("#form-reservation button[value=fermer]");
  await page.click(reserverGit);
  await reserver(page);
  assert.equal(await texteDe(page, "#form-reservation .formulaire__erreur"), "Vous avez déjà réservé cet atelier avec cette adresse.");
  assert.equal(await page.$eval("#form-reservation .formulaire__erreur", (e) => e.getAttribute("role")), "alert");
  assert.equal(await modaleOuverte(page), true, "la modale reste ouverte");
  await page.close();
});

test("annuler ne valide rien et ferme ; un clic sur le fond ferme aussi", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  await page.click(reserverGit);
  await page.click("#form-reservation button[value=annuler]");
  assert.equal(await modaleOuverte(page), false);
  await page.click(reserverGit);
  await page.mouse.click(5, 5);
  assert.equal(await modaleOuverte(page), false);
  await page.close();
});

test("les boutons des cartes n'ont pas d'écouteur : un seul, délégué, sur la section", async () => {
  const page = await nouvellePage(navigateur, serveur.url);
  await pret(page);
  assert.deepEqual(await ecouteurs(page, reserverGit), []);
  assert.deepEqual(await ecouteurs(page, ".ateliers"), []);
  assert.deepEqual(await ecouteurs(page, "#ateliers"), ["click"]);
  await page.close();
});
