// TP 1, point 6 : le parcours ENTIÈREMENT au clavier, sans souris. Chaque arrêt du focus est relevé
// (CLAVIER_VERBEUX=1 pour l'afficher) : c'est le relevé repris dans docs/fm03-tp1-comportement.md.
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

function relevé(page) {
  const etapes = [];
  return {
    etapes,
    async touche(touche, attendu) {
      await page.keyboard.press(touche);
      const actif = await elementActif(page);
      etapes.push(`${touche.padEnd(6)} → ${actif}`);
      if (attendu) assert.match(actif, attendu, `après ${touche} (étape ${etapes.length})`);
      return actif;
    },
    async taper(texte) {
      await page.keyboard.type(texte);
      etapes.push(`saisie « ${texte} »`);
    },
  };
}

test("téléphone, au clavier seul : menu, sous-menu, raccourci, réservation, retour", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 375, hauteur: 800 });
  const r = relevé(page);

  await r.touche("Tab", /"Aller au contenu"/);
  await r.touche("Tab", /^a\.logo/);
  await r.touche("Tab", /^button\.menu-bouton/);
  await r.touche("Enter", /^button\.menu-bouton/);
  assert.equal(await page.$eval(".menu-bouton", (b) => b.getAttribute("aria-expanded")), "true");
  await r.touche("Tab", /"Valeurs"/);
  await r.touche("Tab", /"Ateliers"/);
  await r.touche("Tab", /^button\.navigation__deplier/);
  await r.touche("Enter", /^button\.navigation__deplier/);
  await r.touche("Tab", /"Tout le catalogue"/);
  await r.touche("Tab", /"Pour débutants"/);
  await r.touche("Tab", /"Le soir"/);
  await r.touche("Enter");
  assert.equal(await page.$eval(".menu-bouton", (b) => b.getAttribute("aria-expanded")), "false", "le raccourci referme le menu");
  assert.equal(await texteDe(page, ".filtres__resultat"), "2 ateliers affichés");

  // Le lien suivi a déplacé le point de départ du clavier sur la section des ateliers
  await r.touche("Tab", /^input/);
  assert.equal(await page.$eval(".filtres [name=soir]", (c) => c.checked), true);
  await r.touche("Tab", /^input/);
  await r.touche("Tab", /"Réserver l'atelier Initiation à Git"/);
  await r.touche("Enter", /^input#r-nom/);
  await r.taper("Jonny Martin");
  await r.touche("Tab", /^input#r-courriel/);
  await r.taper("jonny@exemple.fr");
  await r.touche("Enter");
  await page.waitForFunction(() => document.querySelector("#form-reservation .formulaire__confirmation").textContent !== "");
  assert.match(await elementActif(page), /"Fermer"/, "le focus passe sur « Fermer »");
  r.etapes.push(`(confirmation) → ${await elementActif(page)}`);
  await r.touche("Enter", /"Réserver l'atelier Initiation à Git"/);
  await r.touche("Tab", /"Réserver l'atelier Construire son portfolio"/);

  if (process.env.CLAVIER_VERBEUX) console.log(r.etapes.join("\n"));
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("ordinateur, au clavier seul : le formulaire d'inscription, de l'erreur à la confirmation", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 1280, hauteur: 900 });
  const r = relevé(page);
  await page.focus("#nom");
  await r.touche("Enter", /^input#nom/); // Entrée dans un champ envoie le formulaire : tout est vide
  assert.equal(await texteDe(page, "#erreur-nom"), "Indiquez votre prénom et votre nom.");
  await r.taper("Jonny Martin");
  await r.touche("Tab", /^input#courriel/);
  assert.equal(await texteDe(page, "#erreur-nom"), "", "corrigé à la frappe");
  await r.taper("jonny@exemple.fr");
  await r.touche("Tab", /^select#profil/);
  await r.touche("ArrowDown", /^select#profil/);
  await r.touche("Tab", /^input#cgu/);
  await r.touche("Space", /^input#cgu/);
  await r.touche("Tab", /^summary/);
  await r.touche("Tab", /"Créer mon compte"/);
  await r.touche("Enter");
  assert.equal(await texteDe(page, "#form-inscription button[type=submit]"), "Inscription en cours…");
  await page.waitForFunction(() => document.querySelector("#form-inscription .formulaire__confirmation").textContent !== "");
  r.etapes.push(`(confirmation) → ${await elementActif(page)}`);
  assert.match(await elementActif(page), /"Créer mon compte"/, "le focus est resté sur le bouton, rendu");

  if (process.env.CLAVIER_VERBEUX) console.log(r.etapes.join("\n"));
  await page.close();
});
