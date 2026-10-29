// Le fichier ateliers.json du TP 3 : au moins douze ateliers réels, et de quoi tester chaque cas limite.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { estAtelier } from "../../src/js/api.js";
import { estLeSoir } from "../../src/js/format.js";

const ateliers = JSON.parse(fs.readFileSync(new URL("../../src/donnees/ateliers.json", import.meta.url), "utf8"));
const FORMATEURS = ["Sarah Benali", "Thomas Martin", "Aïcha N'Diaye"]; // ceux de la page

test("au moins douze ateliers, chacun valide, identifiants uniques", () => {
  assert.ok(ateliers.length >= 12, `${ateliers.length} ateliers`);
  ateliers.forEach((a) => assert.ok(estAtelier(a), `atelier invalide : ${a.id}`));
  assert.equal(new Set(ateliers.map((a) => a.id)).size, ateliers.length);
  assert.ok(ateliers.every((a) => /^[a-z0-9-]+$/.test(a.id)), "identifiants en minuscules et tirets");
});

test("de quoi tester les cas limites : les trois niveaux, complets, presque complets, gratuits, soir et journée, titres longs", () => {
  assert.deepEqual([...new Set(ateliers.map((a) => a.niveau))].sort(), ["avance", "debutant", "intermediaire"]);
  assert.ok(ateliers.filter((a) => a.places === 0).length >= 2, "au moins deux complets");
  assert.ok(ateliers.some((a) => a.places > 0 && a.places <= 3), "un presque complet");
  assert.ok(ateliers.some((a) => a.places === 1), "une seule place (singulier)");
  assert.ok(ateliers.filter((a) => a.prix === 0).length >= 2, "deux gratuits, pour le tri à prix égal");
  assert.ok(ateliers.some((a) => estLeSoir(a.date)) && ateliers.some((a) => !estLeSoir(a.date)));
  assert.ok(ateliers.some((a) => a.titre.length > 70), "un titre long, pour les cartes");
  assert.ok(ateliers.some((a) => /[éèàïç]/i.test(a.titre)), "des accents, pour la recherche");
});

test("contenu réel : les formateurs de la page, des groupes de huit au plus, des dates à venir à l'heure de Paris", () => {
  ateliers.forEach((a) => {
    assert.ok(FORMATEURS.includes(a.formateur), `${a.id} : ${a.formateur}`);
    assert.ok(a.places <= 8, `${a.id} : huit personnes au maximum (valeur « Proximité »)`);
    assert.ok(a.duree >= 120 && a.duree <= 240, `${a.id} : des ateliers de 2 à 4 heures`);
    assert.match(a.date, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+01:00$/, `${a.id} : heure d'hiver de Paris, écrite en entier`);
    assert.ok(Date.parse(a.date) > Date.parse("2026-10-28T00:00:00+01:00"), `${a.id} : après la fin du module`);
    assert.ok(["En ligne", "Paris"].includes(a.lieu));
  });
});

test("les trois ateliers écrits dans la page (sans JavaScript) sont bien dans le catalogue", () => {
  const html = fs.readFileSync(new URL("../../src/index.html", import.meta.url), "utf8");
  const repli = [...html.matchAll(/<li data-id="([^"]+)">/g)].map((m) => m[1]);
  assert.deepEqual(repli, ["git-initiation", "figma-maquette", "portfolio"]);
  for (const id of repli) {
    const atelier = ateliers.find((a) => a.id === id);
    assert.ok(atelier, id);
    assert.ok(html.includes(`<h3>${atelier.titre}</h3>`), `titre de ${id}`);
    assert.ok(html.includes(`datetime="${atelier.date}"`), `date de ${id}`);
  }
});
