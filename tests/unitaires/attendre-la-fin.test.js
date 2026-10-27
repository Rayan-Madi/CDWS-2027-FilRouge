// attendreLaFin (src/ts/attendre-la-fin.ts), avec des minuteries simulées : le temps avance à la main.
import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { attendreLaFin } from "../../src/js/attendre-la-fin.js";

beforeEach(() => mock.timers.enable({ apis: ["setTimeout"] }));
afterEach(() => mock.timers.reset());

test("taper « accessibilite » lettre à lettre : un seul appel, avec le mot entier, 300 ms après la dernière frappe", () => {
  const appels = [];
  const chercher = attendreLaFin((q) => appels.push(q), 300);
  let saisie = "";
  for (const lettre of "accessibilite") {
    saisie += lettre;
    chercher(saisie);
    mock.timers.tick(120); // on tape plus vite que 300 ms
  }
  assert.deepEqual(appels, [], "rien tant qu'on tape");
  mock.timers.tick(179);
  assert.deepEqual(appels, []);
  mock.timers.tick(1);
  assert.deepEqual(appels, ["accessibilite"], "13 frappes, 1 appel");
});

test("annuler oublie l'appel en attente ; maintenant appelle tout de suite", () => {
  const appels = [];
  const chercher = attendreLaFin((q) => appels.push(q), 300);
  chercher("fig");
  chercher.annuler();
  mock.timers.tick(1000);
  assert.deepEqual(appels, []);
  chercher("figm");
  chercher.maintenant("figma");
  mock.timers.tick(1000);
  assert.deepEqual(appels, ["figma"], "l'appel en attente est oublié");
});
