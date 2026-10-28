// Le serveur de test (tests/outils/serveur.js) : il sert src/, sait tomber en panne, et ne sert rien d'autre.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { demarrerServeur } from "../outils/serveur.js";

let serveur;
before(async () => {
  serveur = await demarrerServeur();
});
after(() => serveur.arreter());

// http.get plutôt que fetch : fetch normaliserait l'adresse (« .. ») avant de l'envoyer
const statutDe = (chemin) =>
  new Promise((fin, echec) => {
    http.get(new URL(serveur.url).origin + chemin, (r) => {
      r.resume();
      fin(r.statusCode);
    }).on("error", echec);
  });

test("sert la page et le catalogue", async () => {
  assert.equal(await statutDe("/"), 200);
  assert.equal(await statutDe("/donnees/ateliers.json"), 200);
  assert.equal(await statutDe("/existe-pas.json"), 404);
});

test("refuse de sortir de src/, et ne tombe pas sur une adresse mal encodée", async () => {
  assert.equal(await statutDe("/..%2f..%2fpackage.json"), 403);
  assert.equal(await statutDe("/..%5c..%5cpackage.json"), 400, "la barre oblique inverse est refusée, sous Windows comme sous Linux");
  assert.equal(await statutDe("/%00"), 400);
  assert.equal(await statutDe("/%"), 400);
  assert.equal(await statutDe("/"), 200, "toujours debout");
});

test("les pannes à la demande : un code, ou un délai", async () => {
  serveur.pannes.set("/donnees/ateliers.json", { statut: 503 });
  assert.equal(await statutDe("/donnees/ateliers.json"), 503);
  serveur.pannes.set("/donnees/ateliers.json", { delai: 150 });
  const debut = Date.now();
  assert.equal(await statutDe("/donnees/ateliers.json"), 200);
  assert.ok(Date.now() - debut >= 140, "la réponse a attendu");
  serveur.pannes.clear();
});
