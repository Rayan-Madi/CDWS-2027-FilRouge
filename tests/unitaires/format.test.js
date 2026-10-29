// Comment un atelier s'affiche (src/ts/format.ts, compilé dans src/js/format.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { formaterDate, estLeSoir, formaterPrix, formaterDuree, formaterPlaces, placesRares, recapAtelier } from "../../src/js/format.js";

const nbsp = (texte) => texte.replace(/ /g, " ");

test("la date est écrite en toutes lettres, à l'heure de Paris", () => {
  assert.equal(formaterDate("2026-11-04T18:30:00+01:00"), `mercredi 4 novembre, ${nbsp("18 h 30")}`);
  assert.equal(formaterDate("2026-11-14T10:00:00+01:00"), `samedi 14 novembre, ${nbsp("10 h")}`);
  // La même heure écrite en UTC : c'est toujours 18 h 30 à Paris
  assert.equal(formaterDate("2026-11-04T17:30:00Z"), `mercredi 4 novembre, ${nbsp("18 h 30")}`);
  assert.equal(formaterDate("2027-02-09T12:05:00+01:00"), `mardi 9 février, ${nbsp("12 h 05")}`);
});

test("« le soir » commence à 18 h, heure de Paris", () => {
  assert.equal(estLeSoir("2026-11-04T18:00:00+01:00"), true);
  assert.equal(estLeSoir("2026-11-04T17:59:00+01:00"), false);
  assert.equal(estLeSoir("2026-11-04T17:30:00Z"), true, "17 h 30 UTC = 18 h 30 à Paris");
  assert.equal(estLeSoir("2027-02-09T12:30:00+01:00"), false);
});

test("le prix, la durée et les places", () => {
  assert.equal(formaterPrix(0), "Gratuit");
  assert.equal(formaterPrix(25), "25 €");
  assert.equal(formaterDuree(180), nbsp("3 h"));
  assert.equal(formaterDuree(150), nbsp("2 h 30"));
  assert.equal(formaterDuree(65), nbsp("1 h 05"));
  assert.deepEqual([0, 1, 2, 3, 4, 8].map(formaterPlaces), ["Complet", "Plus qu'une place", "Plus que 2 places", "Plus que 3 places", "4 places", "8 places"]);
  assert.deepEqual([0, 1, 3, 4].map(placesRares), [false, true, true, false]);
});

test("le récapitulatif de la modale garde la forme de FM02", () => {
  const git = { niveau: "debutant", duree: 180, lieu: "En ligne", date: "2026-11-04T18:30:00+01:00", prix: 25 };
  assert.equal(recapAtelier(git).replace(/ /g, " "), "Niveau débutant · 3 h · en ligne · mercredi 4 novembre, 18 h 30 · 25 €");
  assert.match(recapAtelier({ ...git, lieu: "Paris", niveau: "avance" }), /^Niveau avancé · 3 h · Paris · /);
});
