// Le correctif du prototype (correctif-prototype/code.js) sur un fichier construit AVANT le 02/10/2026 :
// liens en superposition (overlay, swap, fermer) qu'il doit convertir en « Naviguer vers ».
const test = require("node:test");
const assert = require("node:assert/strict");
const { creerSimulateur } = require("./figma-simule.js");

const FONDU = { type: "DISSOLVE", easing: { type: "EASE_OUT" }, duration: 0.3 };
const vers = (cible, navigation) => ({ type: "NODE", destinationId: cible.id, navigation, transition: FONDU, preserveScrollPosition: false });
const clic = { type: "ON_CLICK" };

// Reproduit la page 3 telle que le plugin la construisait avant la correction
async function ancienPrototype() {
  const sim = creerSimulateur();
  global.figma = sim.figma;
  const f = sim.figma;
  const page = f.root.children[0];
  page.name = "3 · Parcours de Jonny";
  const ecran = (nom) => {
    const e = f.createFrame();
    e.name = nom;
    e.layoutMode = "VERTICAL";
    return e;
  };
  const landing = ecran("Landing 360");
  const reserver = f.createFrame();
  reserver.name = "bouton Réserver";
  landing.appendChild(reserver);
  const e = {};
  for (const nom of ["saisie", "erreur", "corrigée", "envoi", "confirmée"]) e[nom] = ecran(`Modale · ${nom}`);
  const bouton = (parent, nom) => {
    const b = f.createFrame();
    b.name = nom;
    parent.appendChild(b);
    return b;
  };
  await reserver.setReactionsAsync([{ trigger: clic, actions: [vers(e.saisie, "OVERLAY")] }]);
  await bouton(e.saisie, "bouton Confirmer").setReactionsAsync([{ trigger: clic, actions: [vers(e.erreur, "SWAP")] }]);
  await bouton(e.erreur, "champ adresse").setReactionsAsync([{ trigger: clic, actions: [vers(e.corrigée, "SWAP")] }]);
  await bouton(e.corrigée, "bouton Confirmer").setReactionsAsync([{ trigger: clic, actions: [vers(e.envoi, "SWAP")] }]);
  await e.envoi.setReactionsAsync([{ trigger: { type: "AFTER_TIMEOUT", timeout: 800 }, actions: [vers(e.confirmée, "SWAP")] }]);
  await bouton(e.confirmée, "bouton Fermer").setReactionsAsync([{ trigger: clic, actions: [{ type: "CLOSE" }] }]);
  for (const nom of ["saisie", "erreur", "corrigée"]) {
    await bouton(e[nom], "bouton Annuler").setReactionsAsync([{ trigger: clic, actions: [{ type: "CLOSE" }] }]);
  }
  return { sim, page, landing, reserver, e };
}

test("le correctif convertit chaque lien en « Naviguer vers », sans toucher aux déclencheurs", async () => {
  const { sim, page, landing, reserver, e } = await ancienPrototype();
  const { corriger } = require("../correctif-prototype/code.js");
  const bilan = await corriger();

  assert.equal(bilan.corriges, 9);
  const liens = page.findAll((n) => n.reactions.length > 0);
  for (const n of liens) {
    for (const a of n.reactions[0].actions) {
      assert.equal(a.type, "NODE", `${n.name} : action`);
      assert.equal(a.navigation, "NAVIGATE", `${n.name} : navigation`);
    }
  }
  assert.equal(reserver.reactions[0].actions[0].destinationId, e.saisie.id);
  assert.deepEqual(e.envoi.reactions[0].trigger, { type: "AFTER_TIMEOUT", timeout: 800 });
  assert.equal(e.envoi.reactions[0].actions[0].destinationId, e.confirmée.id);
  // « Fermer » et « Annuler » ramènent à la page
  const fermer = e.confirmée.findOne((n) => n.name === "bouton Fermer");
  assert.equal(fermer.reactions[0].actions[0].destinationId, landing.id);
  assert.match(sim.journal.fermeture, /9 liens corrigés/);
});

test("relancé sur un prototype déjà corrigé, le correctif ne change rien", async () => {
  await ancienPrototype();
  const { corriger } = require("../correctif-prototype/code.js");
  await corriger();
  const second = await corriger();
  assert.equal(second.corriges, 0);
});
