// @ts-check
/* ==========================================================================
   SkillHub — plugin Figma du TP 3 (FM02) : design system minimal et maquette interactive
   Construit, dans un fichier Figma VIDE, le livrable du TP 3 :
     page 1 : variables (mêmes noms que skillhub.css), styles de texte, 4 composants et leurs états,
              planche des jetons, cas limites
     page 2 : la landing aux paliers 360, 768 et 1280, et l'ordre de tabulation numéroté
     page 3 : le prototype du parcours de Jonny (TP 1)
   Ordre du fichier : données · outils · primitives Figma · constructeurs · point d'entrée.
   Pas d'étape de construction : Figma lit ce fichier tel quel. Syntaxe prudente pour le bac à sable
   de Figma : ni ?. ni ?? ni décomposition d'objet (un test y veille).
   ========================================================================== */

/* ---------- 1. Données ---------- */

// Les jetons de src/css/skillhub.css, en pixels (1 rem = 16 px). Un test vérifie qu'ils n'ont pas divergé.
const JETONS = {
  couleurs: {
    texte: "#12293f",
    "texte-doux": "#44566b",
    fond: "#ffffff",
    "fond-teinte": "#f1f4f8",
    accent: "#0b5cad",
    "accent-fonce": "#084784",
    "accent-clair": "#e3eefa",
    erreur: "#b3261e",
    succes: "#1d6b3a",
    "succes-fond": "#e6f4ea",
    "pied-texte": "#dbe4ee",
    bordure: "#cbd5e1",
  },
  typo: { "t-xs": 14, "t-s": 16, "t-m": 20, "t-l": 25.01, "t-xl": 31.25, "t-2xl": 39.06, "t-3xl": 48.83 },
  espace: { "e-1": 4, "e-2": 8, "e-3": 12, "e-4": 16, "e-6": 24, "e-8": 32, "e-12": 48, "e-16": 64 },
  forme: { "rayon-s": 8, "rayon-m": 12, pilule: 999, cible: 44 },
};

// À quoi sert chaque couleur : recopié dans la description de la variable
const USAGES = {
  texte: "texte courant et titres ; fond du pied de page",
  "texte-doux": "texte secondaire, bordure des champs, bouton désactivé",
  fond: "fond de page et des cartes ; texte des boutons",
  "fond-teinte": "sections alternées, champ désactivé",
  accent: "liens, boutons, anneau de focus",
  "accent-fonce": "survol, focus et appui des boutons ; texte des étiquettes",
  "accent-clair": "fond des étiquettes, survol des liens de navigation",
  erreur: "bordure et message d'erreur (jamais la couleur seule) ; pastilles de tabulation",
  succes: "texte du message de confirmation",
  "succes-fond": "fond du message de confirmation",
  "pied-texte": "texte du pied de page",
  bordure: "bordure décorative des cartes, jamais d'un champ",
};

// Les paires mesurées dans docs/fm02-contrastes.md, avec le libellé exact de leur ligne
const MESURES = [
  { libelle: "--texte sur --fond", avant: "texte", sur: "fond" },
  { libelle: "--texte sur --fond-teinte", avant: "texte", sur: "fond-teinte" },
  { libelle: "--texte-doux sur --fond", avant: "texte-doux", sur: "fond" },
  { libelle: "--texte-doux sur --fond-teinte", avant: "texte-doux", sur: "fond-teinte" },
  { libelle: "--accent (liens) sur --fond", avant: "accent", sur: "fond" },
  { libelle: "--accent (liens) sur --fond-teinte", avant: "accent", sur: "fond-teinte" },
  { libelle: "blanc sur --accent (boutons)", avant: "blanc", sur: "accent" },
  { libelle: "blanc sur --accent-fonce (survol)", avant: "blanc", sur: "accent-fonce" },
  { libelle: "--accent-fonce sur --accent-clair (étiquettes)", avant: "accent-fonce", sur: "accent-clair" },
  { libelle: "--erreur sur --fond", avant: "erreur", sur: "fond" },
  { libelle: "--succes sur fond vert", avant: "succes", sur: "succes-fond" },
  { libelle: "pied : #DBE4EE sur --texte", avant: "pied-texte", sur: "texte" },
  { libelle: "pied : liens blancs sur --texte", avant: "blanc", sur: "texte" },
  { libelle: "bordure de champ (--texte-doux) sur --fond", avant: "texte-doux", sur: "fond" },
  { libelle: "focus (--accent) sur --fond", avant: "accent", sur: "fond" },
  { libelle: "focus (--accent) sur --fond-teinte", avant: "accent", sur: "fond-teinte" },
  { libelle: "focus blanc (pied) sur --texte", avant: "blanc", sur: "texte" },
  { libelle: "bordure de carte (--bordure) sur --fond", avant: "bordure", sur: "fond" },
];

/* ---------- 2. Outils ---------- */

/** @param {string} nom @returns {string} */
function hexDe(nom) {
  if (nom === "blanc") return "#ffffff";
  const hex = /** @type {Record<string, string>} */ (JETONS.couleurs)[nom];
  if (!hex) throw new Error(`Couleur inconnue : ${nom}`);
  return hex;
}

// Formule WCAG 2.2, la même que outils/contrastes.js
/** @param {number} v */
function canal(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** @param {string} hex */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => canal(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** @param {string} hexA @param {string} hexB @returns {number} */
function ratioContraste(hexA, hexB) {
  const [clair, sombre] = [luminance(hexA), luminance(hexB)].sort((x, y) => y - x);
  return (clair + 0.05) / (sombre + 0.05);
}

// Tronqué à deux décimales, comme le vérificateur de WebAIM, avec une virgule
/** @param {number} ratio */
function formaterRatio(ratio) {
  return (Math.floor(ratio * 100) / 100).toFixed(2).replace(".", ",");
}

/** @param {string} nom @returns {string} */
function descriptionCouleur(nom) {
  const ratios = [];
  for (const { avant, sur } of MESURES) {
    let ligne = "";
    if (avant === nom) ligne = `sur ${sur} : `;
    else if (sur === nom) ligne = `${avant} dessus : `;
    else continue;
    ligne += `${formaterRatio(ratioContraste(hexDe(avant), hexDe(sur)))}:1`;
    if (ratios.indexOf(ligne) === -1) ratios.push(ligne);
  }
  const usage = /** @type {Record<string, string>} */ (USAGES)[nom] || "";
  return [usage].concat(ratios).join(" · ");
}

/** @param {string} hex @returns {RGB} */
function hexVersRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

/* ---------- 5. Point d'entrée ---------- */

async function main() {
  figma.closePlugin("Plugin en cours d'écriture.");
}

// Sous Node (tests), on exporte ; dans Figma, module n'existe pas et on construit.
// @ts-ignore — module n'est déclaré que sous Node
if (typeof module !== "undefined") module.exports = { JETONS, USAGES, MESURES, hexDe, ratioContraste, formaterRatio, descriptionCouleur, hexVersRgb, main };
else main();
