// Le filtre du catalogue, en logique pure (src/ts/filtre.ts).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CRITERES_PAR_DEFAUT, normaliser, filtrerAteliers, decrireResultat, estNiveau, estTri, MESSAGE_VIDE } from "../../src/js/filtre.js";

const ateliers = JSON.parse(fs.readFileSync(new URL("../../src/donnees/ateliers.json", import.meta.url), "utf8"));
const criteres = (changement) => ({ ...CRITERES_PAR_DEFAUT, ...changement });
const ids = (liste) => liste.map((a) => a.id);

test("normaliser : sans accents, sans majuscules, espaces resserrés", () => {
  assert.equal(normaliser("  Accessibilité   NUMÉRIQUE "), "accessibilite numerique");
  assert.equal(normaliser("Aïcha N'Diaye"), "aicha n'diaye");
});

test("sans critère : tout le catalogue, du plus proche au plus lointain", () => {
  const resultat = filtrerAteliers(ateliers, CRITERES_PAR_DEFAUT);
  assert.equal(resultat.length, ateliers.length);
  const dates = resultat.map((a) => Date.parse(a.date));
  assert.deepEqual(dates, [...dates].sort((a, b) => a - b));
});

test("la recherche ignore accents et majuscules, et porte sur le titre, le formateur et le thème", () => {
  assert.deepEqual(ids(filtrerAteliers(ateliers, criteres({ recherche: "accessibilite" }))), ["accessibilite-formulaires"]);
  assert.deepEqual(ids(filtrerAteliers(ateliers, criteres({ recherche: "FIGMA" }))), ["figma-maquette", "design-system-figma"]);
  const aicha = filtrerAteliers(ateliers, criteres({ recherche: "aicha" }));
  assert.ok(aicha.length > 0 && aicha.every((a) => a.formateur === "Aïcha N'Diaye"));
  const design = filtrerAteliers(ateliers, criteres({ recherche: "design" }));
  assert.ok(design.every((a) => a.categorie === "Design" || /design/i.test(a.titre)));
  // Plusieurs mots : chacun doit s'y trouver, dans n'importe quel ordre
  assert.deepEqual(ids(filtrerAteliers(ateliers, criteres({ recherche: "sarah git" }))), ["git-initiation"]);
  assert.deepEqual(filtrerAteliers(ateliers, criteres({ recherche: "cobol" })), []);
});

test("le niveau et « le soir »", () => {
  const debutants = filtrerAteliers(ateliers, criteres({ niveau: "debutant" }));
  assert.ok(debutants.length > 0 && debutants.every((a) => a.niveau === "debutant"));
  const soir = filtrerAteliers(ateliers, criteres({ soir: true }));
  assert.ok(soir.length > 0 && soir.length < ateliers.length);
  assert.ok(!ids(soir).includes("financer-formation"), "12 h 30 n'est pas le soir");
  const lesDeux = filtrerAteliers(ateliers, criteres({ niveau: "avance", soir: true }));
  assert.deepEqual(ids(lesDeux), ["typescript-projet", "api-fetch"]);
});

test("le tri par prix, à prix égal le plus proche d'abord ; le catalogue d'origine n'est jamais réordonné", () => {
  const avant = JSON.stringify(ateliers);
  const croissant = filtrerAteliers(ateliers, criteres({ tri: "prix-croissant" }));
  const prix = croissant.map((a) => a.prix);
  assert.deepEqual(prix, [...prix].sort((a, b) => a - b));
  const gratuits = croissant.filter((a) => a.prix === 0);
  assert.ok(Date.parse(gratuits[0].date) < Date.parse(gratuits[1].date), "à prix égal, par date");
  const decroissant = filtrerAteliers(ateliers, criteres({ tri: "prix-decroissant" }));
  assert.equal(decroissant[0].prix, Math.max(...ateliers.map((a) => a.prix)));
  assert.equal(JSON.stringify(ateliers), avant, "sort n'a pas touché au tableau d'origine");
});

test("le compteur nomme le résultat et chaque critère : il change à chaque changement", () => {
  assert.equal(decrireResultat(14, CRITERES_PAR_DEFAUT), "14 ateliers · par date");
  assert.equal(decrireResultat(1, criteres({ recherche: " git " })), "1 atelier · « git » · par date");
  assert.equal(
    decrireResultat(4, criteres({ niveau: "debutant", soir: true, tri: "prix-croissant" })),
    "4 ateliers · niveau débutant · le soir · par prix croissant"
  );
  assert.equal(decrireResultat(0, criteres({ niveau: "avance" })), MESSAGE_VIDE);
  // Deux critères différents, même nombre : deux textes différents, donc deux annonces
  assert.notEqual(decrireResultat(5, criteres({ tri: "date" })), decrireResultat(5, criteres({ tri: "prix-croissant" })));
});

test("les gardes de type refusent ce qui n'est pas prévu", () => {
  assert.ok(estNiveau("avance") && !estNiveau("tous") && !estNiveau("Avancé") && !estNiveau(undefined));
  assert.ok(estTri("prix-croissant") && !estTri("prix") && !estTri("toString"));
});
