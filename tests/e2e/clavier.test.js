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
      // Certains effets d'une touche partent dans une tâche suivante (l'événement close d'un <dialog>,
      // et le focus qu'il rend) : on attend la CONDITION — le focus attendu, au plus 2 s — et non un délai
      // arbitraire, qui dépendrait de la vitesse de la machine
      let actif = await elementActif(page);
      for (let essai = 0; attendu && !attendu.test(actif) && essai < 40; essai += 1) {
        await new Promise((fin) => setTimeout(fin, 50));
        actif = await elementActif(page);
      }
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
  assert.match(await texteDe(page, ".catalogue__statut"), / · le soir · par date$/);

  // Le lien suivi a déplacé le point de départ du clavier sur la section des ateliers
  await r.touche("Tab", /^input#recherche/);
  await r.touche("Tab", /^select#niveau/);
  await r.touche("Tab", /^select#tri/);
  await r.touche("Tab", /^input#soir/);
  assert.equal(await page.$eval("#soir", (c) => c.checked), true);
  await r.touche("Tab", /"Réserver l'atelier Initiation à Git"/);
  await r.touche("Enter", /^input#r-nom/);
  await r.taper("Jonny Martin");
  await r.touche("Tab", /^input#r-courriel/);
  await r.taper("jonny@exemple.fr");
  await r.touche("Enter");
  await page.waitForFunction(() => (document.querySelector("#form-reservation .formulaire__confirmation").textContent !== "" && !document.querySelector("#form-reservation .formulaire__confirmation").hasAttribute("data-en-cours")));
  assert.match(await elementActif(page), /"Fermer"/, "le focus passe sur « Fermer »");
  r.etapes.push(`(confirmation) → ${await elementActif(page)}`);
  await r.touche("Enter", /"Réserver l'atelier Initiation à Git"/);
  await r.touche("Tab", /"Réserver l'atelier Construire son portfolio"/);

  if (process.env.CLAVIER_VERBEUX) console.log(r.etapes.join("\n"));
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("TP 3, au clavier seul : filtrer, trier, ouvrir une fiche, revenir — le compteur change à chaque étape", async () => {
  const page = await nouvellePage(navigateur, serveur.url, { largeur: 1280, hauteur: 900 });
  await page.waitForFunction(() => document.querySelector(".ateliers").getAttribute("aria-busy") === "false");
  const r = relevé(page);
  const annonces = [await texteDe(page, ".catalogue__statut")];
  const noter = async () => {
    await page.waitForFunction((t) => document.querySelector(".catalogue__statut").textContent !== t, {}, annonces.at(-1));
    const texte = await texteDe(page, ".catalogue__statut");
    annonces.push(texte);
    r.etapes.push(`(annonce) « ${texte} »`);
  };

  await page.focus(".accroche__actions .action--secondaire"); // « Voir les ateliers »
  await r.touche("Enter");
  await r.touche("Tab", /^input#recherche/);
  await r.taper("sarah"); // les ateliers de Sarah Benali
  await noter();
  await r.touche("Tab", /^select#niveau/);
  await r.touche("ArrowDown", /^select#niveau/); // débutant
  await noter();
  await r.touche("Tab", /^select#tri/);
  await r.touche("ArrowDown", /^select#tri/); // prix croissant
  await noter();
  await r.touche("Tab", /^input#soir/);
  await r.touche("Space", /^input#soir/);
  await noter();
  await r.touche("Space", /^input#soir/);
  await noter();
  // Une zone polie n'annonce qu'un texte qui change : chaque annonce diffère de la précédente
  annonces.slice(1).forEach((texte, i) => assert.notEqual(texte, annonces[i], `étape ${i + 1} : ${annonces.join(" | ")}`));
  assert.equal(annonces.length, 6);

  assert.deepEqual(annonces.slice(1), [
    "5 ateliers · « sarah » · par date",
    "2 ateliers · « sarah » · niveau débutant · par date",
    "2 ateliers · « sarah » · niveau débutant · par prix croissant",
    "1 atelier · « sarah » · niveau débutant · le soir · par prix croissant",
    "2 ateliers · « sarah » · niveau débutant · par prix croissant",
  ]);

  const carte = await r.touche("Tab", /^button\.action "Réserver l'atelier HTML et CSS/);
  await r.touche("Enter", /^input#r-nom/);
  assert.equal(await page.$eval("#modale-reservation", (d) => d.open), true);
  await r.touche("Escape");
  assert.equal(await elementActif(page), carte, "revenu sur la carte d'où l'on était parti");

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
  await page.waitForFunction(() => (document.querySelector("#form-inscription .formulaire__confirmation").textContent !== "" && !document.querySelector("#form-inscription .formulaire__confirmation").hasAttribute("data-en-cours")));
  r.etapes.push(`(confirmation) → ${await elementActif(page)}`);
  assert.match(await elementActif(page), /"Créer mon compte"/, "le focus est resté sur le bouton, rendu");

  if (process.env.CLAVIER_VERBEUX) console.log(r.etapes.join("\n"));
  await page.close();
});
