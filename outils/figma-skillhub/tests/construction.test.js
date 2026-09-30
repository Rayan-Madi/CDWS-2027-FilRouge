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

/* ---------- Composants : carte d'atelier et modale ; planche des jetons ---------- */

test("la carte d'atelier est un composant à propriétés de contenu, avec une instance de bouton", () => {
  const carte = jeu("carte-atelier");
  assert.equal(carte.type, "COMPONENT");
  const noms = Object.keys(carte.componentPropertyDefinitions).map((k) => k.split("#")[0]);
  assert.deepEqual(noms.sort(), ["description", "infos", "prix", "titre", "étiquette"].sort());
  const bouton = nomme(carte, "bouton Réserver");
  assert.equal(bouton.type, "INSTANCE");
  assert.equal(bouton.mainComponent.name, "type=principal, état=repos");
});

test("la modale a quatre étapes, garde la saisie en erreur et confirme l'atelier, la date et l'adresse", () => {
  const modale = jeu("modale");
  assert.equal(modale.type, "COMPONENT_SET");
  assert.equal(modale.children.length, 4);
  for (const etape of ["saisie", "erreur", "envoi", "confirmée"]) assert.ok(variante(modale, `étape=${etape}`), `étape ${etape} absente`);

  const adresse = nomme(variante(modale, "étape=erreur"), "champ adresse");
  assert.equal(adresse.mainComponent.name, "type=texte, état=erreur");
  assert.equal(nomme(adresse, "valeur").characters, "jonny@gmail");

  const envoi = nomme(variante(modale, "étape=envoi"), "bouton Confirmer");
  assert.equal(envoi.mainComponent.name, "type=principal, état=chargement");

  const attendu = plugin.confirmationReservation("Jonny", plugin.CONTENU.ateliers.items[0], "jonny@gmail.com");
  const confirmee = variante(modale, "étape=confirmée");
  assert.ok(confirmee.findOne((n) => n.type === "TEXT" && n.characters === attendu), "message de confirmation absent");
  assert.ok(nomme(confirmee, "bouton Fermer"));
  assert.equal(nomme(confirmee, "champ adresse"), null, "la saisie disparaît une fois confirmé");
});

test("la planche des jetons montre chaque couleur avec ses ratios", () => {
  const planche = jeu("planche · jetons");
  assert.ok(planche, "planche absente");
  for (const nom of Object.keys(plugin.JETONS.couleurs)) {
    assert.ok(nomme(planche, `nuancier ${nom}`), `nuancier ${nom} absent`);
  }
  const accent = nomme(planche, "nuancier accent");
  assert.ok(accent.findOne((n) => n.type === "TEXT" && /6,66:1/.test(n.characters)));
  assert.ok(nomme(planche, "échelle typographique"));
  assert.ok(nomme(planche, "pas d'espacement"));
});

/* ---------- Cas limites, landing aux trois paliers, images ---------- */

const frameLanding = (largeur) => page(sim, "2 ·").children.find((n) => n.name === String(largeur));
const textes = (noeud) => tous(noeud, (n) => n.type === "TEXT").map((t) => t.characters);

test("les cas limites sont sur la page 1 : titre de trois lignes, catalogue vide, champs en erreur", () => {
  const cas = jeu("cas limites");
  assert.ok(cas, "cadre « cas limites » absent");
  const long = nomme(cas, "titre long");
  assert.ok(textes(long).includes(plugin.MAQUETTE.titreLong));
  const vide = nomme(cas, "catalogue vide");
  assert.equal(tous(vide, (n) => n.name.startsWith("carte · ")).length, 0);
  assert.ok(nomme(vide, "message catalogue vide").visible);
  assert.ok(textes(vide).includes(plugin.CONTENU.ateliers.vide));
  assert.ok(textes(vide).includes(plugin.CONTENU.ateliers.filtres.resultatVide));
  const erreurs = nomme(cas, "champ en erreur");
  assert.ok(textes(erreurs).includes(plugin.CONTENU.messages.nomManquant));
  assert.ok(textes(erreurs).includes(plugin.CONTENU.messages.courrielInvalide));
});

test("la landing existe aux trois paliers, en auto-layout, avec sa grille de colonnes", () => {
  for (const largeur of [360, 768, 1280]) {
    const f = frameLanding(largeur);
    assert.ok(f, `frame ${largeur} absente`);
    assert.equal(f.width, largeur);
    assert.equal(f.layoutMode, "VERTICAL");
    assert.equal(f.layoutGrids[0].count, plugin.PALIERS[largeur].grille.count);
    assert.equal(tous(f, (n) => n.type === "INSTANCE" && n.name.startsWith("carte · ")).length, 3, `cartes à ${largeur}`);
  }
});

test("le bouton Menu remplace les liens à 360 ; les liens sont visibles dès 768", () => {
  assert.ok(nomme(frameLanding(360), "bouton Menu"));
  assert.equal(nomme(frameLanding(360), "lien Valeurs"), null);
  for (const largeur of [768, 1280]) {
    assert.ok(nomme(frameLanding(largeur), "lien Valeurs"), `liens absents à ${largeur}`);
    assert.equal(nomme(frameLanding(largeur), "bouton Menu"), null);
  }
});

test("la landing montre le contenu réel", () => {
  const contenu = textes(frameLanding(1280));
  for (const attendu of ["Reprenez la main sur votre reconversion", "25 €", "35 €", "Gratuit", "Sarah Benali", "Aïcha N'Diaye", "Créez votre compte", plugin.CONTENU.pied.mention]) {
    assert.ok(contenu.includes(attendu), `« ${attendu} » absent de la frame 1280`);
  }
});

test("les vraies images sont posées, converties par l'iframe", () => {
  const accroche = nomme(frameLanding(1280), "image : accroche");
  assert.equal(accroche.fills[0].type, "IMAGE");
  const photos = tous(frameLanding(360), (n) => n.name.startsWith("photo · "));
  assert.equal(photos.length, 3);
  photos.forEach((p) => assert.equal(p.fills[0].type, "IMAGE"));
  assert.ok(sim.journal.messagesUi.some((m) => m.type === "charger-images" && m.urls.length === 4));
});

test("sans réseau, des cadres gris remplacent les images et le rapport le dit", async () => {
  const muet = await construire({ images: "muet" });
  assert.deepEqual(muet.rapport.filter((l) => l.startsWith("✗")), []);
  assert.ok(muet.rapport.some((l) => l.startsWith("⚠ Images")));
  const f = page(muet, "2 ·").children.find((n) => n.name === "1280");
  assert.equal(nomme(f, "image : accroche").fills[0].type, "SOLID");
});

/* ---------- Ordre de tabulation ---------- */

test("l'ordre de tabulation est numéroté à 1280 et à 360, du lien d'évitement au pied de page", () => {
  const landing = page(sim, "2 ·");
  for (const [largeur, nombre] of [[1280, 23], [360, 20]]) {
    const f = landing.children.find((n) => n.name === `${largeur} · tabulation`);
    assert.ok(f, `frame ${largeur} · tabulation absente`);
    const pastilles = tous(f, (n) => /^pastille \d+$/.test(n.name));
    assert.deepEqual(pastilles.map((n) => n.name), Array.from({ length: nombre }, (_, i) => `pastille ${i + 1}`));
    pastilles.forEach((n) => assert.equal(n.layoutPositioning, "ABSOLUTE"));
    assert.deepEqual(textes(nomme(f, "pastille 1")), ["1"]);
    assert.ok(nomme(f, "lien d'évitement").visible, "le lien d'évitement doit être montré");
  }
  for (const largeur of [360, 768, 1280]) {
    assert.equal(tous(frameLanding(largeur), (n) => n.name.startsWith("pastille")).length, 0, `pastilles sur la frame ${largeur}`);
    assert.equal(nomme(frameLanding(largeur), "lien d'évitement").visible, false);
  }
});

/* ---------- Prototype : le parcours de Jonny ---------- */

test("le prototype joue le parcours de Jonny, de « Réserver » à la confirmation", () => {
  const parcours = page(sim, "3 ·");
  const ecran = (nom) => parcours.children.find((n) => n.name === nom);
  const landing = ecran("Landing 360");
  assert.ok(landing, "Landing 360 absente");
  const noms = ["saisie", "erreur", "corrigée", "envoi", "confirmée"];
  const [saisie, erreur, corrigee, envoi, confirmee] = noms.map((n) => ecran(`Modale · ${n}`));
  [saisie, erreur, corrigee, envoi, confirmee].forEach((e, i) => {
    assert.ok(e, `écran Modale · ${noms[i]} absent`);
    assert.equal(e.width, 360);
    assert.equal(e.height, 800);
  });
  assert.deepEqual(parcours.flowStartingPoints, [{ nodeId: landing.id, name: "Réserver un atelier le soir" }]);

  const action = (noeud) => noeud.reactions[0].actions[0];
  const vers = (noeud, cible, navigation) => {
    assert.ok(noeud.reactions.length > 0, `${noeud.name} sans réaction`);
    assert.equal(action(noeud).navigation, navigation, `${noeud.name} : navigation`);
    assert.equal(action(noeud).destinationId, cible.id, `${noeud.name} : destination`);
  };

  const carte = nomme(landing, "carte · Initiation à Git");
  const reserver = carte.findOne((n) => n.reactions.length > 0) || carte;
  vers(reserver, saisie, "OVERLAY");
  vers(nomme(saisie, "bouton Confirmer"), erreur, "SWAP");
  vers(nomme(erreur, "champ adresse"), corrigee, "SWAP");
  vers(nomme(corrigee, "bouton Confirmer"), envoi, "SWAP");
  assert.deepEqual(envoi.reactions[0].trigger, { type: "AFTER_TIMEOUT", timeout: plugin.DELAI_ENVOI_MS });
  vers(envoi, confirmee, "SWAP");
  assert.equal(action(nomme(confirmee, "bouton Fermer")).type, "CLOSE");
  for (const e of [saisie, erreur, corrigee]) assert.equal(action(nomme(e, "bouton Annuler")).type, "CLOSE");

  assert.equal(nomme(nomme(saisie, "champ adresse"), "valeur").characters, "jonny@gmail");
  assert.equal(nomme(nomme(corrigee, "champ adresse"), "valeur").characters, "jonny@gmail.com");
});

/* ---------- Règles relevées dans le vrai Figma (sondes du 30/09/2026) ---------- */

test("les cadres qui épousent leur contenu le restent après avoir reçu une largeur", () => {
  for (const v of jeu("champ").children) assert.equal(v.layoutSizingVertical, "HUG", v.name);
  for (const v of jeu("modale").children) assert.equal(v.layoutSizingVertical, "HUG", v.name);
  assert.equal(jeu("carte-atelier").layoutSizingVertical, "HUG");
  for (const largeur of [360, 768, 1280]) {
    assert.equal(frameLanding(largeur).layoutSizingVertical, "HUG", `frame ${largeur}`);
    assert.equal(nomme(frameLanding(largeur), "colonne").layoutSizingVertical, "HUG", `colonne à ${largeur}`);
  }
});

test("chaque texte de la landing garde un style, y compris les titres fluides à 768", () => {
  for (const largeur of [360, 768, 1280]) {
    const sansStyle = tous(frameLanding(largeur), (n) => n.type === "TEXT" && !n.textStyleId).map((n) => n.name);
    assert.deepEqual(sansStyle, [], `textes sans style à ${largeur}`);
  }
});

test("à 360, les textes et les rangées longs passent à la ligne au lieu de déborder", () => {
  const f = frameLanding(360);
  assert.equal(nomme(f, "mention du pied").layoutSizingHorizontal, "FILL");
  assert.equal(nomme(f, "liens du pied").layoutSizingHorizontal, "FILL");
  assert.equal(nomme(f, "filtrer les ateliers").layoutSizingHorizontal, "FILL");
  // Relevé sur la capture réelle : la fin de l'appel aux formateurs était tassée à droite du lien
  const appel = nomme(f, "appel aux formateurs");
  assert.equal(appel.layoutMode, "VERTICAL");
  assert.equal(nomme(appel, "appel · suite").layoutSizingHorizontal, "FILL");
  const cgu = nomme(f, `option ${plugin.CONTENU.inscription.cgu}`);
  assert.equal(cgu.layoutSizingHorizontal, "FILL");
  assert.equal(nomme(cgu, "libellé").layoutSizingHorizontal, "FILL");
});

test("même quand les polices manquent, le plugin se ferme et rend son rapport", async () => {
  const sansPolice = await construire({ polices: [] });
  assert.notEqual(sansPolice.journal.fermeture, null, "closePlugin n'a pas été appelé");
  assert.ok(sansPolice.rapport.some((l) => l.startsWith("✗ Polices")), "l'échec des polices doit figurer au rapport");
});

test("une étape en panne n'arrête pas les suivantes, et le rapport la nomme", async () => {
  const panne = await construire({ panne: "createNodeFromSvg" });
  const ligne = (debut) => panne.rapport.find((l) => l.slice(2).startsWith(debut));
  assert.match(ligne("Composant champ"), /^✗ .*createNodeFromSvg/);
  assert.match(ligne("Composant bouton"), /^✓/);
  assert.match(ligne("Composant carte d'atelier"), /^✓/, "la carte ne dépend que du bouton");
  // La modale contient des champs : elle tombe avec eux, et le rapport dit pourquoi
  assert.match(ligne("Composant modale"), /^✗ .*« champ » n'a pas été construit/);
  assert.match(panne.journal.fermeture, /échec/);
  const rapport = nomme(page(panne, "1 ·"), "rapport du plugin");
  assert.ok(rapport && rapport.characters.includes("✗ Composant champ"));
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

