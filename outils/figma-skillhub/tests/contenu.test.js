// La maquette montre le VRAI contenu (cours, 4.3, règle 5) : chaque texte vient de la page ou de son script.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { CONTENU, recapAtelier, confirmationReservation, ORDRE_TABULATION, PALIERS } = require("../code.js");

const racine = path.join(__dirname, "..", "..", "..");
const html = fs.readFileSync(path.join(racine, "src/index.html"), "utf8");
const js = fs.readFileSync(path.join(racine, "src/js/skillhub.js"), "utf8");
// Le texte de la page, balises retirées et espaces normalisés (y compris insécables)
const textePage = html.replace(/<[^>]+>/g, " ").replace(/[\s  ]+/g, " ");
const normaliser = (texte) => texte.replace(/[\s  ]+/g, " ");

function dansLaPage(texte) {
  assert.ok(textePage.includes(normaliser(texte)), `absent de index.html : « ${texte} »`);
}

test("l'en-tête, l'accroche et le pied viennent de la page", () => {
  [CONTENU.evitement, CONTENU.logo, CONTENU.menu].forEach(dansLaPage);
  CONTENU.navigation.forEach((lien) => dansLaPage(lien.texte));
  [CONTENU.accroche.titre, CONTENU.accroche.texte].concat(CONTENU.accroche.actions).forEach(dansLaPage);
  CONTENU.pied.liens.forEach(dansLaPage);
  dansLaPage(CONTENU.pied.mention);
});

test("les valeurs, les ateliers et les formateurs viennent de la page", () => {
  dansLaPage(CONTENU.valeurs.titre);
  CONTENU.valeurs.items.forEach((v) => [v.titre, v.texte].forEach(dansLaPage));
  dansLaPage(CONTENU.ateliers.titre);
  [CONTENU.ateliers.filtres.legende].concat(CONTENU.ateliers.filtres.options).forEach(dansLaPage);
  dansLaPage(CONTENU.ateliers.vide);
  assert.equal(CONTENU.ateliers.items.length, 3);
  CONTENU.ateliers.items.forEach((a) => [a.titre, a.etiquette, a.description, a.infos, a.prix].forEach(dansLaPage));
  dansLaPage(CONTENU.formateurs.titre);
  CONTENU.formateurs.items.forEach((f) => [f.nom, f.role, f.citation].forEach(dansLaPage));
  const appel = CONTENU.formateurs.appel;
  dansLaPage(`${appel.avant} ${appel.lien} ${appel.apres}`);
});

test("le formulaire d'inscription vient de la page", () => {
  const i = CONTENU.inscription;
  [i.titre, i.texte, i.nom, i.courriel, i.aideCourriel, i.profil, i.profilDefaut, i.cgu, i.conditions, i.bouton].forEach(dansLaPage);
  dansLaPage(CONTENU.modale.aideCourriel);
  [CONTENU.modale.confirmer, CONTENU.modale.annuler, CONTENU.modale.fermer].forEach(dansLaPage);
});

test("les messages et les états viennent du script", () => {
  const m = CONTENU.messages;
  [m.nomManquant, m.courrielInvalide, m.chargement].forEach((texte) => {
    assert.ok(js.includes(texte), `absent de skillhub.js : « ${texte} »`);
  });
  assert.ok(js.includes("ateliers affichés") && js.includes("atelier affiché"));
});

test("le récapitulatif et la confirmation reprennent les gabarits du script", () => {
  const git = CONTENU.ateliers.items[0];
  assert.equal(recapAtelier(git), "Niveau débutant · 3 h · en ligne · mercredi 7 octobre, 18 h 30 · 25 €");
  assert.ok(js.includes("recap.textContent = `${atelier.querySelector(\".atelier__infos\").textContent} · ${atelier.querySelector(\".atelier__prix\").textContent}`"));
  assert.equal(
    confirmationReservation("Jonny", git, "jonny@gmail.com"),
    "C'est réservé, Jonny ! Initiation à Git : Niveau débutant · 3 h · en ligne · mercredi 7 octobre, 18 h 30 · 25 €. Le lien de l'atelier arrivera à jonny@gmail.com la veille."
  );
  assert.ok(js.includes("`C'est réservé, ${prenom} ! ${titreAtelier.textContent} : ${recap.textContent}. Le lien de l'atelier arrivera à ${formReservation.courriel.value.trim()} la veille.`"));
});

test("l'ordre de tabulation va du lien d'évitement au pied de page", () => {
  const grand = ORDRE_TABULATION[1280];
  const petit = ORDRE_TABULATION[360];
  assert.equal(grand.length, 23);
  assert.equal(petit.length, 20);
  for (const ordre of [grand, petit]) {
    const cles = ordre.map((e) => e.cle);
    assert.equal(new Set(cles).size, cles.length, "clés en double");
    assert.equal(cles[0], "evitement");
    assert.equal(cles[cles.length - 1], "pied-inscription");
    ordre.forEach((e) => assert.ok(e.libelle, `libellé manquant pour ${e.cle}`));
  }
  assert.ok(petit.some((e) => e.cle === "menu") && !grand.some((e) => e.cle === "menu"));
  assert.ok(!petit.some((e) => e.cle.startsWith("nav-")));
  // Après l'en-tête, les deux paliers suivent le même ordre
  assert.deepEqual(petit.slice(3).map((e) => e.cle), grand.slice(6).map((e) => e.cle));
});

test("les tailles de titre des paliers sont celles des clamp() du CSS", () => {
  const borne = (min, v, max) => Math.min(Math.max(min, v), max);
  for (const largeur of [360, 768, 1280]) {
    const p = PALIERS[largeur];
    assert.equal(p.largeur, largeur);
    assert.ok(Math.abs(p.h1 - borne(31.25, (5 * largeur) / 100 + 8, 48.83)) < 0.02, `h1 à ${largeur}`);
    assert.ok(Math.abs(p.h2 - borne(25.01, (3 * largeur) / 100 + 8, 39.06)) < 0.02, `h2 à ${largeur}`);
  }
});
