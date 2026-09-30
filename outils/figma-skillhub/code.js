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

// Les images de la page, servies par GitHub Pages (converties en PNG par ui.html)
const SITE = "https://rayan-madi.github.io/CDWS-2027-FilRouge/src/";

// Les icônes de la page, en SVG : currentColor devient la couleur d'accent
const ICONES = {
  logo:
    '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#0b5cad"/><path d="M9 20c1.5 2 4 3 7 3 3.5 0 6-1.6 6-4.2 0-2.4-2-3.4-5.6-4.2-3-.7-4-1.2-4-2.4 0-1.2 1.2-2 3.2-2 1.9 0 3.3.7 4.2 1.8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
  menu:
    '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="#12293f" stroke-width="2" stroke-linecap="round"/></svg>',
  chevron:
    '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 6l5 5 5-5" fill="none" stroke="#12293f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  coche:
    '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  proximite:
    '<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 11a4 4 0 1 0-8 0M4 20c0-3 3.6-5 8-5s8 2 8 5M12 3v2" fill="none" stroke="#0b5cad" stroke-width="1.8" stroke-linecap="round"/></svg>',
  transparence:
    '<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" fill="none" stroke="#0b5cad" stroke-width="1.8"/><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="#0b5cad" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  exigence:
    '<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="none" stroke="#0b5cad" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};

// Le contenu réel de src/index.html et src/js/skillhub.js (cours, 4.3, règle 5 : pas de faux texte)
const CONTENU = {
  evitement: "Aller au contenu",
  logo: "SkillHub",
  menu: "Menu",
  navigation: [
    { cle: "nav-valeurs", texte: "Valeurs" },
    { cle: "nav-ateliers", texte: "Ateliers" },
    { cle: "nav-formateurs", texte: "Formateurs" },
    { cle: "nav-inscription", texte: "S'inscrire" },
  ],
  accroche: {
    titre: "Reprenez la main sur votre reconversion",
    texte: "Des ateliers courts et concrets, animés par des formateurs indépendants qui ont fait le chemin avant vous.",
    actions: ["Créer mon compte", "Voir les ateliers"],
    image: { url: SITE + "images/accroche-800.webp", largeur: 800, hauteur: 492, nom: "accroche" },
  },
  valeurs: {
    titre: "Nos valeurs",
    items: [
      { titre: "Proximité", icone: "proximite", texte: "Des groupes de huit personnes au maximum : votre formateur connaît votre prénom et votre projet." },
      { titre: "Transparence", icone: "transparence", texte: "Le prix, le programme et les avis des anciens participants sont affichés avant toute inscription." },
      { titre: "Exigence", icone: "exigence", texte: "Chaque atelier se termine par une réalisation concrète que vous pouvez montrer à un recruteur." },
    ],
  },
  ateliers: {
    titre: "Les ateliers du moment",
    filtres: {
      legende: "Filtrer les ateliers",
      options: ["Le soir (à partir de 18 h)", "Ouverts aux débutants"],
      resultat: "3 ateliers affichés",
      resultatVide: "0 atelier affiché",
    },
    items: [
      {
        titre: "Initiation à Git",
        etiquette: "Développement",
        description: "Versionner son travail, revenir en arrière et collaborer sur GitHub sans peur de tout casser.",
        infos: "Niveau débutant · 3 h · en ligne · mercredi 7 octobre, 18 h 30",
        prix: "25 €",
      },
      {
        titre: "Maquetter une page avec Figma",
        etiquette: "Design",
        description: "Passer d'une idée griffonnée à une maquette propre, prête à être intégrée.",
        infos: "Niveau intermédiaire · 4 h · Paris · samedi 17 octobre, 10 h",
        prix: "35 €",
      },
      {
        titre: "Construire son portfolio",
        etiquette: "Carrière",
        description: "Choisir ses projets, les présenter et les mettre en ligne gratuitement.",
        infos: "Tous niveaux · 2 h · en ligne · mercredi 21 octobre, 19 h",
        prix: "Gratuit",
      },
    ],
    vide: "Aucun atelier ne correspond à ces filtres. Décochez-en un pour élargir la recherche.",
  },
  formateurs: {
    titre: "Nos formateurs",
    items: [
      { nom: "Sarah Benali", role: "Développeuse web", citation: "J'ai changé de métier à 34 ans. Je transmets ce que j'aurais aimé qu'on m'apprenne.", photo: SITE + "images/sarah-benali-288.webp" },
      { nom: "Thomas Martin", role: "Designer UX/UI", citation: "Une bonne interface, c'est celle qu'on ne remarque pas. Ça s'apprend.", photo: SITE + "images/thomas-martin-288.webp" },
      { nom: "Aïcha N'Diaye", role: "Coach en reconversion", citation: "Votre ancien métier n'est pas un poids : c'est votre différence.", photo: SITE + "images/aicha-ndiaye-288.webp" },
    ],
    appel: {
      avant: "Vous êtes formateur indépendant ?",
      lien: "Créez votre compte",
      apres: "en choisissant « Formateur indépendant » : vous pourrez proposer vos ateliers.",
    },
  },
  inscription: {
    titre: "Créer mon compte",
    texte: "L'inscription est gratuite. Vous ne payez que les ateliers que vous réservez.",
    nom: "Prénom et nom",
    courriel: "Adresse électronique",
    aideCourriel: "Nous ne la transmettons à personne.",
    profil: "Je suis",
    profilDefaut: "Choisissez",
    cgu: "J'accepte les conditions d'utilisation",
    conditions: "Lire les conditions d'utilisation",
    bouton: "Créer mon compte",
  },
  modale: {
    titre: "Réserver : ",
    aideCourriel: "Pour recevoir la date, le lieu et le lien de l'atelier.",
    confirmer: "Confirmer la réservation",
    annuler: "Annuler",
    fermer: "Fermer",
  },
  pied: {
    liens: ["Haut de page", "Ateliers", "S'inscrire"],
    mention: "SkillHub · IMIE Paris · projet pédagogique · 2026",
  },
  messages: {
    nomManquant: "Indiquez votre prénom et votre nom.",
    courrielInvalide: "L'adresse doit ressembler à nom@exemple.fr.",
    chargement: "Réservation en cours…",
  },
};

// Textes propres à la maquette : ils ne sont pas (encore) dans la page
const MAQUETTE = {
  // « Désactivé » dit pourquoi (cours, 3.4) ; la règle métier elle-même se décide ailleurs (4.4)
  desactive: "Complet · liste d'attente",
  // Cas limite : un titre qui tient sur trois lignes à 360 px
  titreLong: "Maquetter une page responsive avec Figma, de la grille aux composants",
  jonny: { nom: "Jonny Petit", prenom: "Jonny", courrielFaute: "jonny@gmail", courriel: "jonny@gmail.com" },
};

/** @param {{infos: string, prix: string}} atelier */
function recapAtelier(atelier) {
  return `${atelier.infos} · ${atelier.prix}`;
}

/** @param {string} prenom @param {{titre: string, infos: string, prix: string}} atelier @param {string} courriel */
function confirmationReservation(prenom, atelier, courriel) {
  return `C'est réservé, ${prenom} ! ${atelier.titre} : ${recapAtelier(atelier)}. Le lien de l'atelier arrivera à ${courriel} la veille.`;
}

// L'ordre de tabulation attendu (cours, 4.3, règle 8), du lien d'évitement au pied de page.
// cle : le nom sous lequel le constructeur de la landing range l'élément focalisable.
const ORDRE_APRES_ENTETE = [
  { cle: "accroche-compte", libelle: "Créer mon compte (accroche)" },
  { cle: "accroche-ateliers", libelle: "Voir les ateliers" },
  { cle: "filtre-soir", libelle: "Filtre : le soir" },
  { cle: "filtre-debutants", libelle: "Filtre : débutants" },
  { cle: "reserver-1", libelle: "Réserver : Initiation à Git" },
  { cle: "reserver-2", libelle: "Réserver : Maquetter une page avec Figma" },
  { cle: "reserver-3", libelle: "Réserver : Construire son portfolio" },
  { cle: "appel-formateurs", libelle: "Créez votre compte (formateurs)" },
  { cle: "champ-nom", libelle: "Champ : prénom et nom" },
  { cle: "champ-courriel", libelle: "Champ : adresse électronique" },
  { cle: "champ-profil", libelle: "Liste : je suis" },
  { cle: "case-cgu", libelle: "Case : conditions" },
  { cle: "conditions", libelle: "Lire les conditions" },
  { cle: "bouton-inscription", libelle: "Créer mon compte (formulaire)" },
  { cle: "pied-haut", libelle: "Haut de page" },
  { cle: "pied-ateliers", libelle: "Ateliers (pied)" },
  { cle: "pied-inscription", libelle: "S'inscrire (pied)" },
];
const ORDRE_TABULATION = {
  1280: [
    { cle: "evitement", libelle: "Aller au contenu" },
    { cle: "logo", libelle: "SkillHub (haut de page)" },
    { cle: "nav-valeurs", libelle: "Valeurs" },
    { cle: "nav-ateliers", libelle: "Ateliers" },
    { cle: "nav-formateurs", libelle: "Formateurs" },
    { cle: "nav-inscription", libelle: "S'inscrire" },
  ].concat(ORDRE_APRES_ENTETE),
  // Menu fermé à 360 : les liens de navigation ne sont pas atteignables avant d'ouvrir le menu
  360: [
    { cle: "evitement", libelle: "Aller au contenu" },
    { cle: "logo", libelle: "SkillHub (haut de page)" },
    { cle: "menu", libelle: "Menu" },
  ].concat(ORDRE_APRES_ENTETE),
};

// Les trois paliers, calés sur les media queries de skillhub.css (48em, 64em).
// h1 et h2 : les clamp() du CSS calculés à cette largeur. marge : --espace ou le centrage à 1152 px.
const PALIERS = {
  360: {
    largeur: 360, marge: 16, contenu: 328, sectionY: 48, accrocheHaut: 32, accrocheBas: 48,
    accrocheMarge: 16, accrocheColonnes: [1], accrocheEcart: 32, colonnes: 1, formulaireColonnes: 1,
    navigation: "menu", h1: 31.25, h2: 25.01, grille: { count: 4, gutter: 16, offset: 16 },
  },
  768: {
    largeur: 768, marge: 32, contenu: 704, sectionY: 64, accrocheHaut: 64, accrocheBas: 64,
    accrocheMarge: 32, accrocheColonnes: [1, 1], accrocheEcart: 32, colonnes: 2, formulaireColonnes: 2,
    navigation: "liens", h1: 46.4, h2: 31.04, grille: { count: 8, gutter: 24, offset: 32 },
  },
  1280: {
    largeur: 1280, marge: 64, contenu: 1152, sectionY: 64, accrocheHaut: 64, accrocheBas: 64,
    accrocheMarge: 96, accrocheColonnes: [1.1, 1], accrocheEcart: 64, colonnes: 3, formulaireColonnes: 2,
    navigation: "liens", h1: 48.83, h2: 39.06, grille: { count: 12, gutter: 24, offset: 64 },
  },
};

// Le délai simulé de skillhub.js (DELAI_SIMULE), repris par le prototype. L'API compte en millisecondes.
const DELAI_ENVOI_MS = 800;

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
if (typeof module !== "undefined") module.exports = { JETONS, USAGES, MESURES, CONTENU, MAQUETTE, ORDRE_TABULATION, PALIERS, DELAI_ENVOI_MS, hexDe, ratioContraste, formaterRatio, descriptionCouleur, hexVersRgb, recapAtelier, confirmationReservation, main };
else main();
