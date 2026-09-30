// main() de bout en bout, sur le simulateur de l'API Figma (tests/figma-simule.js).
const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const { creerSimulateur } = require("./figma-simule.js");
const plugin = require("../code.js");

async function construire(options, preparer) {
  const sim = creerSimulateur(options);
  global.figma = sim.figma;
  global.__html__ = "";
  if (preparer) preparer(sim);
  sim.rapport = await plugin.main({ delaiImagesMs: 50 });
  return sim;
}

const page = (sim, debut) => sim.figma.root.children.find((p) => p.name.startsWith(debut));
const tous = (noeud, test) => noeud.findAll(test);
const nomme = (noeud, nom) => noeud.findOne((n) => n.name === nom);

// Une construction complète, partagée par les tests qui ne font que lire
let sim;
before(async () => {
  sim = await construire();
});

test("le plugin va au bout, sans étape en échec", () => {
  assert.notEqual(sim.journal.fermeture, null, "closePlugin n'a pas été appelé");
  const echecs = sim.rapport.filter((ligne) => ligne.startsWith("✗"));
  assert.deepEqual(echecs, []);
});

test("le fichier compte trois pages, nommées", () => {
  assert.deepEqual(
    sim.figma.root.children.map((p) => p.name),
    ["1 · Design system", "2 · Landing", "3 · Parcours de Jonny"]
  );
});

test("les variables portent les noms du CSS, leurs ratios et leur syntaxe de code", () => {
  assert.equal(sim.collections.length, 1);
  assert.equal(sim.collections[0].name, "SkillHub");
  assert.equal(sim.variables.length, 12 + 7 + 8 + 4);
  const texte = sim.variables.find((v) => v.name === "couleurs/texte");
  assert.equal(texte.codeSyntax.WEB, "var(--texte)");
  for (const v of sim.variables.filter((v) => v.resolvedType === "COLOR")) {
    assert.match(v.description, /:1/, `${v.name} sans ratio`);
  }
  const e6 = sim.variables.find((v) => v.name === "espace/e-6");
  assert.equal(Object.values(e6.valuesByMode)[0], 24);
});

test("les styles de texte suivent l'échelle et sont liés aux variables de taille", () => {
  const noms = sim.stylesTexte.map((s) => s.name);
  for (const nom of ["t-xs/400", "t-xs/600", "t-s/400", "t-s/600", "t-m/600", "t-l/600", "t-3xl/600"]) {
    assert.ok(noms.includes(nom), `style ${nom} absent`);
  }
  const tl = sim.stylesTexte.find((s) => s.name === "t-l/600");
  assert.equal(tl.fontSize, 25.01);
  assert.equal(tl.fontName.family, "Sora");
  const variable = sim.variables.find((v) => v.name === "typo/t-l");
  assert.equal(tl.boundVariables.fontSize.id, variable.id);
});

/* ---------- Composants : bouton et champ ---------- */

const jeu = (nom) => nomme(page(sim, "1 ·"), nom);
const variante = (jeuDeComposants, nom) => jeuDeComposants.children.find((c) => c.name === nom);
const variableNommee = (nom) => sim.variables.find((v) => v.name === nom);
const lieeA = (peinture, nom) => peinture.boundVariables && peinture.boundVariables.color.id === variableNommee(nom).id;

test("le bouton a deux types et six états, soit douze variantes nommées", () => {
  const bouton = jeu("bouton");
  assert.equal(bouton.type, "COMPONENT_SET");
  assert.equal(bouton.children.length, 12);
  for (const type of ["principal", "secondaire"]) {
    for (const etat of ["repos", "survol", "focus", "actif", "désactivé", "chargement"]) {
      assert.ok(variante(bouton, `type=${type}, état=${etat}`), `variante type=${type}, état=${etat} absente`);
    }
  }
  const proprietes = Object.keys(bouton.componentPropertyDefinitions);
  assert.ok(proprietes.some((p) => p.startsWith("libellé#")), "propriété texte « libellé » absente");
});

test("le bouton est construit avec les jetons, pas avec des valeurs brutes", () => {
  const repos = variante(jeu("bouton"), "type=principal, état=repos");
  assert.ok(lieeA(repos.fills[0], "couleurs/accent"), "fond du bouton non lié à accent");
  assert.equal(repos.boundVariables.paddingLeft.id, variableNommee("espace/e-6").id);
  assert.equal(repos.boundVariables.cornerRadius.id, variableNommee("forme/pilule").id);
  const survol = variante(jeu("bouton"), "type=principal, état=survol");
  assert.ok(lieeA(survol.fills[0], "couleurs/accent-fonce"));
});

test("le focus du bouton est un anneau posé sur le fond, et chargement dit ce qui se passe", () => {
  const focus = variante(jeu("bouton"), "type=principal, état=focus");
  const anneau = nomme(focus, "anneau de focus");
  assert.ok(anneau, "anneau de focus absent");
  assert.equal(anneau.layoutPositioning, "ABSOLUTE");
  assert.equal(anneau.strokeWeight, 3);
  assert.ok(lieeA(anneau.strokes[0], "couleurs/accent"));
  const chargement = variante(jeu("bouton"), "type=principal, état=chargement");
  assert.ok(nomme(chargement, "libellé").characters.includes("en cours"));
  const desactive = variante(jeu("bouton"), "type=principal, état=désactivé");
  assert.ok(lieeA(desactive.fills[0], "couleurs/texte-doux"));
});

test("le champ a deux types et six états, avec libellé, aide et message d'erreur", () => {
  const champ = jeu("champ");
  assert.equal(champ.type, "COMPONENT_SET");
  assert.equal(champ.children.length, 12);
  for (const type of ["texte", "liste"]) {
    for (const etat of ["repos", "survol", "focus", "rempli", "erreur", "désactivé"]) {
      assert.ok(variante(champ, `type=${type}, état=${etat}`), `variante type=${type}, état=${etat} absente`);
    }
  }
  const proprietes = Object.keys(champ.componentPropertyDefinitions);
  for (const nom of ["libellé#", "aide#", "texte d'aide#"]) {
    assert.ok(proprietes.some((p) => p.startsWith(nom)), `propriété ${nom} absente`);
  }
  const erreur = variante(champ, "type=texte, état=erreur");
  const zone = nomme(erreur, "zone de saisie");
  assert.equal(zone.strokeWeight, 2);
  assert.ok(lieeA(zone.strokes[0], "couleurs/erreur"));
  assert.ok(nomme(erreur, "message d'erreur").visible);
  assert.equal(nomme(variante(champ, "type=texte, état=repos"), "message d'erreur").visible, false);
  assert.ok(nomme(variante(champ, "type=liste, état=repos"), "icône chevron"));
});

test("un fichier qui n'est pas vide est laissé intact", async () => {
  const autre = await construire({}, (s) => {
    s.figma.createFrame().name = "travail de l'étudiant";
  });
  assert.equal(autre.figma.root.children.length, 1);
  assert.equal(autre.figma.root.children[0].name, "Page 1");
  assert.ok(autre.journal.notifications.some((n) => /nouveau fichier Figma vide/.test(n.message)));
  assert.notEqual(autre.journal.fermeture, null);
});

test("sans Sora, le plugin se replie sur Inter et le signale", async () => {
  const sansSora = await construire({ polices: [{ family: "Inter", style: "Regular" }, { family: "Inter", style: "Semi Bold" }] });
  assert.ok(sansSora.rapport.some((l) => /Inter/.test(l)));
  assert.deepEqual(sansSora.rapport.filter((l) => l.startsWith("✗")), []);
  assert.equal(sansSora.stylesTexte[0].fontName.family, "Inter");
});

