// chargerAteliers (src/ts/api.ts) face à toutes les sorties d'un fetch : fetch est remplacé par un faux.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerAteliers, estAtelier, ErreurChargement, URL_ATELIERS } from "../../src/js/api.js";

const ateliers = JSON.parse(fs.readFileSync(new URL("../../src/donnees/ateliers.json", import.meta.url), "utf8"));
const vraiFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = vraiFetch;
});

const repondre = (corps, init = {}) => {
  globalThis.fetch = async (url, options) => {
    repondre.dernier = { url: String(url), options };
    return new Response(typeof corps === "string" ? corps : JSON.stringify(corps), { status: 200, ...init });
  };
};

// Un serveur qui ne répond jamais : seule une annulation (ou le délai) l'arrête, comme un vrai fetch
const neJamaisRepondre = () => {
  globalThis.fetch = (url, { signal }) =>
    new Promise((_, rejeter) => signal.addEventListener("abort", () => rejeter(signal.reason), { once: true }));
};

const raisonDe = async (promesse) => {
  try {
    await promesse;
    return "aucune erreur";
  } catch (erreur) {
    return erreur instanceof ErreurChargement ? `${erreur.raison}${erreur.statut ? ` ${erreur.statut}` : ""}` : erreur.name;
  }
};

test("200 : le catalogue, vérifié, et la requête demande du JSON", async () => {
  repondre(ateliers);
  const resultat = await chargerAteliers();
  assert.equal(resultat.length, ateliers.length);
  assert.equal(repondre.dernier.url, URL_ATELIERS.href);
  assert.equal(repondre.dernier.options.headers.Accept, "application/json");
  assert.ok(repondre.dernier.options.signal instanceof AbortSignal, "toujours un signal : au moins le délai");
});

test("le fichier est cherché à côté du module compilé : src/donnees/ateliers.json", () => {
  assert.match(URL_ATELIERS.href, /\/src\/donnees\/ateliers\.json$/);
});

test("404 et 500 : fetch ne rejette pas, chargerAteliers si — avec le code, pour la console", async () => {
  repondre("<h1>Introuvable</h1>", { status: 404 });
  assert.equal(await raisonDe(chargerAteliers()), "http 404");
  repondre("<h1>Panne</h1>", { status: 500 });
  assert.equal(await raisonDe(chargerAteliers()), "http 500");
});

test("réseau coupé : la seule chose que fetch rejette devient une panne « réseau »", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  assert.equal(await raisonDe(chargerAteliers()), "reseau");
});

test("pas de réponse dans le délai : une panne « délai », pas un indicateur qui tourne pour toujours", async () => {
  neJamaisRepondre();
  assert.equal(await raisonDe(chargerAteliers(undefined, { delaiMax: 30 })), "delai");
});

test("une annulation par l'appelant n'est pas une panne : l'AbortError passe telle quelle", async () => {
  neJamaisRepondre();
  const arret = new AbortController();
  const promesse = chargerAteliers(arret.signal, { delaiMax: 5000 });
  arret.abort();
  assert.equal(await raisonDe(promesse), "AbortError");
});

test("sans AbortSignal.any ni AbortSignal.timeout (navigateurs d'avant 2024) : tout marche encore", async () => {
  const { any, timeout } = AbortSignal;
  try {
    delete AbortSignal.any;
    delete AbortSignal.timeout;
    repondre(ateliers);
    assert.equal((await chargerAteliers()).length, ateliers.length);
    neJamaisRepondre();
    assert.equal(await raisonDe(chargerAteliers(undefined, { delaiMax: 30 })), "delai");
  } finally {
    AbortSignal.any = any;
    AbortSignal.timeout = timeout;
  }
});

test("un signal déjà annulé : rien ne part, l'AbortError revient", async () => {
  let appele = false;
  globalThis.fetch = (url, { signal }) => {
    appele = true;
    return signal.aborted ? Promise.reject(signal.reason) : Promise.resolve(new Response("[]"));
  };
  const arret = new AbortController();
  arret.abort();
  assert.equal(await raisonDe(chargerAteliers(arret.signal)), "AbortError");
  assert.ok(appele, "fetch reçoit un signal déjà tombé, et rejette aussitôt");
});

test("une page d'erreur HTML servie en 200, ou des données de mauvaise forme : panne « format »", async () => {
  repondre("<!DOCTYPE html><p>Maintenance</p>");
  assert.equal(await raisonDe(chargerAteliers()), "format");
  repondre({ ateliers }); // un objet au lieu d'une liste
  assert.equal(await raisonDe(chargerAteliers()), "format");
  repondre([{ ...ateliers[0], prix: "25 €" }]); // le type est une promesse : un prix en chaîne ne passe pas
  assert.equal(await raisonDe(chargerAteliers()), "format");
});

test("estAtelier refuse chaque champ manquant ou faux", () => {
  const bon = ateliers[0];
  assert.equal(estAtelier(bon), true);
  for (const champ of Object.keys(bon)) {
    const { [champ]: _, ...sans } = bon;
    assert.equal(estAtelier(sans), false, `sans ${champ}`);
  }
  const fautifs = [
    { niveau: "expert" },
    { prix: -5 },
    { prix: Number.NaN },
    { places: 1.5 },
    { places: -1 },
    { duree: 0 },
    { date: "bientôt" },
    { titre: "   " },
  ];
  for (const faute of fautifs) assert.equal(estAtelier({ ...bon, ...faute }), false, JSON.stringify(faute));
  assert.equal(estAtelier(null), false);
  assert.equal(estAtelier([bon]), false);
});
