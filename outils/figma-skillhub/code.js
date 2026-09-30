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

/** @param {number} n */
function formaterNombre(n) {
  return String(Math.round(n * 1000) / 1000).replace(".", ",");
}

/* ---------- 3. Primitives Figma ---------- */

/**
 * @typedef {{
 *   variables: Record<string, Variable>,
 *   styles: Record<string, TextStyle>,
 *   police: { regulier: FontName, gras: FontName },
 *   composants: Record<string, any>,
 *   images: Record<string, string>,
 *   pages: Record<string, PageNode>,
 *   rapport: string[],
 *   curseur: number,
 *   options: { delaiImagesMs: number }
 * }} Etat
 */

/** @param {{delaiImagesMs?: number}} [options] @returns {Etat} */
function nouvelEtat(options) {
  return {
    variables: {},
    styles: {},
    police: { regulier: { family: "Sora", style: "Regular" }, gras: { family: "Sora", style: "SemiBold" } },
    composants: {},
    images: {},
    pages: {},
    rapport: [],
    curseur: 0,
    options: Object.assign({ delaiImagesMs: 20000 }, options || {}),
  };
}

// L'état d'une construction : rempli au fil des étapes, remis à zéro à chaque lancement
let ETAT = nouvelEtat();

// La valeur d'un jeton en pixels : "e-6" → 24, "t-m" → 20, "rayon-m" → 12 ; un nombre passe tel quel
/** @param {string|number} jeton @returns {number} */
function valeur(jeton) {
  if (typeof jeton === "number") return jeton;
  for (const groupe of [JETONS.espace, JETONS.typo, JETONS.forme]) {
    const px = /** @type {Record<string, number>} */ (groupe)[jeton];
    if (px !== undefined) return px;
  }
  throw new Error(`Jeton inconnu : ${jeton}`);
}

// Une peinture unie LIÉE à la variable du jeton : la maquette ne contient pas de valeur brute.
// « blanc » reste brut, comme le #fff du CSS.
/** @param {string} nom @param {number} [opacite] @returns {SolidPaint} */
function peinture(nom, opacite) {
  /** @type {SolidPaint} */
  const base = { type: "SOLID", color: hexVersRgb(hexDe(nom)), opacity: opacite === undefined ? 1 : opacite };
  const variable = ETAT.variables[nom];
  return variable ? figma.variables.setBoundVariableForPaint(base, "color", variable) : base;
}

// Règle un champ numérique et le lie à la variable du jeton, s'il y en a une
/** @param {SceneNode} noeud @param {VariableBindableNodeField} champ @param {string|number} jeton */
function regler(noeud, champ, jeton) {
  const px = valeur(jeton);
  // width et height sont en lecture seule dans Figma : on passe par resize()
  if (champ === "width" || champ === "height") {
    const n = /** @type {FrameNode} */ (noeud);
    n.resize(champ === "width" ? px : n.width, champ === "height" ? px : n.height);
  } else {
    /** @type {any} */ (noeud)[champ] = px;
  }
  if (typeof jeton === "string" && ETAT.variables[jeton]) noeud.setBoundVariable(champ, ETAT.variables[jeton]);
}

/** @param {Array<string|number>} marge @returns {Array<string|number>} haut, droite, bas, gauche */
function etendreMarge(marge) {
  if (marge.length === 1) return [marge[0], marge[0], marge[0], marge[0]];
  if (marge.length === 2) return [marge[0], marge[1], marge[0], marge[1]];
  return marge;
}

/**
 * @typedef {{
 *   sens?: "HORIZONTAL" | "VERTICAL",
 *   ecart?: string | number,
 *   marge?: Array<string | number>,
 *   fond?: string,
 *   fondOpacite?: number,
 *   bordure?: string,
 *   epaisseur?: number,
 *   pointilles?: boolean,
 *   rayon?: string | number,
 *   axe?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN",
 *   travers?: "MIN" | "CENTER" | "MAX" | "BASELINE",
 *   retour?: boolean,
 *   ecartLignes?: string | number
 * }} OptionsCadre
 */

// L'auto-layout de Figma, c'est Flexbox (cours, 4.2) : sens = flex-direction, ecart = gap, marge = padding
/** @template {FrameNode | ComponentNode} T @param {T} f @param {string} nom @param {OptionsCadre} [o] @returns {T} */
function reglerCadre(f, nom, o) {
  const r = o || {};
  f.name = nom;
  f.layoutMode = r.sens || "VERTICAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = r.fond ? [peinture(r.fond, r.fondOpacite)] : [];
  f.clipsContent = false;
  if (r.ecart !== undefined) regler(f, "itemSpacing", r.ecart);
  if (r.marge) {
    const [haut, droite, bas, gauche] = etendreMarge(r.marge);
    regler(f, "paddingTop", haut);
    regler(f, "paddingRight", droite);
    regler(f, "paddingBottom", bas);
    regler(f, "paddingLeft", gauche);
  }
  if (r.bordure) {
    f.strokes = [peinture(r.bordure)];
    f.strokeWeight = r.epaisseur || 1;
    f.strokeAlign = "INSIDE";
    if (r.pointilles) f.dashPattern = [4, 3];
  }
  if (r.rayon !== undefined) regler(f, "cornerRadius", r.rayon);
  if (r.axe) f.primaryAxisAlignItems = r.axe;
  if (r.travers) f.counterAxisAlignItems = r.travers;
  if (r.retour) {
    f.layoutWrap = "WRAP";
    if (r.ecartLignes !== undefined) regler(f, "counterAxisSpacing", r.ecartLignes);
  }
  return f;
}

/** @param {string} nom @param {OptionsCadre} [o] @returns {FrameNode} */
function cadre(nom, o) {
  return reglerCadre(figma.createFrame(), nom, o);
}

/** @param {string} nom @param {OptionsCadre} [o] @returns {ComponentNode} */
function composant(nom, o) {
  return reglerCadre(figma.createComponent(), nom, o);
}

/** @typedef {"FILL" | "HUG" | number | undefined} Dimension */

/** @param {SceneNode} n @param {Dimension} largeur @param {Dimension} [hauteur] */
function dimensionner(n, largeur, hauteur) {
  const d = /** @type {FrameNode} */ (n);
  if (largeur === "FILL" || largeur === "HUG") d.layoutSizingHorizontal = largeur;
  else if (typeof largeur === "number") {
    d.resize(largeur, d.height);
    d.layoutSizingHorizontal = "FIXED";
  }
  if (hauteur === "FILL" || hauteur === "HUG") d.layoutSizingVertical = hauteur;
  else if (typeof hauteur === "number") {
    d.resize(d.width, hauteur);
    d.layoutSizingVertical = "FIXED";
  }
  // Un texte à largeur imposée passe à la ligne ; un texte « HUG » tient sur une ligne
  if (n.type === "TEXT" && largeur !== undefined) n.textAutoResize = largeur === "HUG" ? "WIDTH_AND_HEIGHT" : "HEIGHT";
}

/**
 * @template {SceneNode} T
 * @param {FrameNode | ComponentNode | ComponentSetNode | PageNode} parent @param {T} enfant
 * @param {Dimension} [largeur] @param {Dimension} [hauteur] @returns {T}
 */
function ajouter(parent, enfant, largeur, hauteur) {
  parent.appendChild(enfant);
  if (parent.type !== "PAGE") dimensionner(enfant, largeur, hauteur);
  return enfant;
}

/**
 * Un texte posé avec un style de l'échelle et une couleur liée
 * @param {string} contenu
 * @param {{ style?: string, couleur?: string, taille?: number, aligner?: "LEFT" | "CENTER" | "RIGHT", souligne?: boolean, nom?: string }} [o]
 * @returns {Promise<TextNode>}
 */
async function texte(contenu, o) {
  const r = o || {};
  const style = ETAT.styles[r.style || "t-s/400"];
  if (!style) throw new Error(`Style de texte inconnu : ${r.style}`);
  const t = figma.createText();
  await t.setTextStyleIdAsync(style.id);
  t.characters = contenu;
  // Titres fluides (clamp() du CSS) : la taille calculée au palier remplace celle du style
  if (r.taille) t.fontSize = r.taille;
  t.fills = [peinture(r.couleur || "texte")];
  if (r.aligner) t.textAlignHorizontal = r.aligner;
  if (r.souligne) t.textDecoration = "UNDERLINE";
  t.name = r.nom || contenu.slice(0, 48);
  return t;
}

/** @param {keyof typeof ICONES} nom @returns {FrameNode} */
function icone(nom) {
  const f = figma.createNodeFromSvg(ICONES[nom]);
  f.name = `icône ${nom}`;
  f.fills = [];
  return f;
}

/* ---------- 4. Constructeurs ---------- */

// Sora, la police de la page ; à défaut, Inter (toujours présente dans Figma)
async function chargerPolices() {
  const disponibles = await figma.listAvailableFontsAsync();
  /** @param {string} famille @param {RegExp} motif */
  const trouver = (famille, motif) => {
    const f = disponibles.find((p) => p.fontName.family === famille && motif.test(p.fontName.style));
    return f ? f.fontName : null;
  };
  const regulier = trouver("Sora", /^regular$/i);
  const gras = trouver("Sora", /^semi ?bold$/i);
  if (regulier && gras) {
    ETAT.police = { regulier, gras };
  } else {
    ETAT.police = { regulier: { family: "Inter", style: "Regular" }, gras: { family: "Inter", style: "Semi Bold" } };
    ETAT.rapport.push("⚠ Sora est introuvable dans Figma : les textes sont en Inter. Installe Sora (Google Fonts) et relance dans un nouveau fichier.");
  }
  await figma.loadFontAsync(ETAT.police.regulier);
  await figma.loadFontAsync(ETAT.police.gras);
  await figma.loadFontAsync({ family: "Inter", style: "Regular" }); // la police d'un texte neuf, et celle du rapport
}

// Les jetons, avec les mêmes noms que le CSS : Dev Mode affichera var(--accent), pas #0B5CAD
async function creerVariables() {
  const collection = figma.variables.createVariableCollection("SkillHub");
  const mode = collection.modes[0].modeId;
  collection.renameMode(mode, "clair");

  for (const nom of Object.keys(JETONS.couleurs)) {
    const v = figma.variables.createVariable(`couleurs/${nom}`, collection, "COLOR");
    v.setValueForMode(mode, hexVersRgb(hexDe(nom)));
    v.description = descriptionCouleur(nom);
    v.setVariableCodeSyntax("WEB", `var(--${nom})`);
    ETAT.variables[nom] = v;
  }

  /** @type {Array<[string, Record<string, number>, VariableScope[]]>} */
  const groupes = [
    ["typo", JETONS.typo, ["FONT_SIZE"]],
    ["espace", JETONS.espace, ["GAP", "WIDTH_HEIGHT"]],
    ["forme", JETONS.forme, ["CORNER_RADIUS", "WIDTH_HEIGHT"]],
  ];
  for (const [groupe, jetons, portees] of groupes) {
    for (const nom of Object.keys(jetons)) {
      const px = jetons[nom];
      const v = figma.variables.createVariable(`${groupe}/${nom}`, collection, "FLOAT");
      v.setValueForMode(mode, px);
      v.description = nom === "pilule" ? "999 px : une forme (boutons, étiquettes), pas un rayon" : `${formaterNombre(px / 16)} rem`;
      v.setVariableCodeSyntax("WEB", `var(--${nom})`);
      v.scopes = portees;
      ETAT.variables[nom] = v;
    }
  }
}

// Un style par cran de l'échelle et par graisse employée ; la taille est liée à sa variable
/** @type {Array<[string, number]>} */
const STYLES_TEXTE = [
  ["t-xs", 400], ["t-xs", 600], ["t-s", 400], ["t-s", 600], ["t-m", 400], ["t-m", 600],
  ["t-l", 600], ["t-xl", 600], ["t-2xl", 600], ["t-3xl", 600],
];

async function creerStylesTexte() {
  for (const [cran, graisse] of STYLES_TEXTE) {
    const style = figma.createTextStyle();
    style.name = `${cran}/${graisse}`;
    style.fontName = graisse === 600 ? ETAT.police.gras : ETAT.police.regulier;
    style.fontSize = valeur(cran);
    // --interligne-titre (1,2) pour les titres, --interligne (1,5) pour le texte courant
    const titre = graisse === 600 && valeur(cran) >= 20;
    style.lineHeight = { unit: "PERCENT", value: titre ? 120 : 150 };
    style.setBoundVariable("fontSize", ETAT.variables[cran]);
    style.description = `var(--${cran}), ${graisse === 600 ? "600" : "400"}, interligne ${titre ? "1,2" : "1,5"}`;
    ETAT.styles[style.name] = style;
  }
}

/* ----- Mise en page de la page 1 : les blocs s'empilent de haut en bas ----- */

/** @param {SceneNode} noeud @param {number} [ecart] */
function placer(noeud, ecart) {
  noeud.x = 0;
  noeud.y = ETAT.curseur;
  ETAT.curseur += noeud.height + (ecart === undefined ? 120 : ecart);
}

// Le titre d'un bloc de la page 1, et la règle du cours qu'il illustre
/** @param {string} titre @param {string} [detail] */
async function legende(titre, detail) {
  const bloc = cadre(`légende · ${titre}`, { ecart: "e-1" });
  ajouter(bloc, await texte(titre, { style: "t-xl/600" }), "HUG");
  if (detail) ajouter(bloc, await texte(detail, { style: "t-s/400", couleur: "texte-doux" }), 720);
  placer(bloc, 24);
}

// Les variantes d'un jeu, rangées en grille : une ligne par type, une colonne par état
/** @param {ComponentSetNode} jeu @param {number} colonnes */
function arrangerVariantes(jeu, colonnes) {
  const variantes = jeu.children;
  const largeur = Math.max.apply(null, variantes.map((v) => v.width));
  const hauteur = Math.max.apply(null, variantes.map((v) => v.height));
  variantes.forEach((v, i) => {
    v.x = 40 + (i % colonnes) * (largeur + 48);
    v.y = 40 + Math.floor(i / colonnes) * (hauteur + 48);
  });
  const lignes = Math.ceil(variantes.length / colonnes);
  jeu.resize(80 + colonnes * largeur + (colonnes - 1) * 48, 80 + lignes * hauteur + (lignes - 1) * 48);
}

// L'anneau de focus : 3 px d'accent, posé à 3 px du bord (outline-offset) donc SUR LE FOND, pas sur le composant.
// Rectangle en position absolue qui déborde de 6 px et suit le composant quand il change de taille.
/** @param {FrameNode | ComponentNode} porteur @param {string | number} rayon */
function anneauDeFocus(porteur, rayon) {
  const anneau = figma.createRectangle();
  anneau.name = "anneau de focus";
  porteur.appendChild(anneau);
  anneau.layoutPositioning = "ABSOLUTE";
  anneau.x = -6;
  anneau.y = -6;
  anneau.resize(porteur.width + 12, porteur.height + 12);
  anneau.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
  anneau.fills = [];
  anneau.strokes = [peinture("accent")];
  anneau.strokeWeight = 3;
  anneau.strokeAlign = "INSIDE";
  regler(anneau, "cornerRadius", rayon);
  return anneau;
}

/** @param {string} nomJeu @param {Record<string, string>} proprietes @returns {InstanceNode} */
function instance(nomJeu, proprietes) {
  const jeu = /** @type {ComponentSetNode} */ (ETAT.composants[nomJeu].jeu);
  const cible = jeu.children.find((c) => {
    const vp = /** @type {ComponentNode} */ (c).variantProperties || {};
    return Object.keys(proprietes).every((k) => vp[k] === proprietes[k]);
  });
  if (!cible) throw new Error(`${nomJeu} : aucune variante ${JSON.stringify(proprietes)}`);
  return /** @type {ComponentNode} */ (cible).createInstance();
}

const ETATS_BOUTON = ["repos", "survol", "focus", "actif", "désactivé", "chargement"];

// Composant 1 : le bouton (.action). Six états, parce qu'une maquette qui n'en montre qu'un
// laisse l'intégrateur inventer les cinq autres (cours, 3.4).
async function creerBouton() {
  await legende("Bouton — 2 types × 6 états", "Repos, survol, focus (anneau de 3 px posé sur le fond), actif, désactivé (le libellé dit pourquoi), chargement (« … en cours »). Hauteur ≥ 44 px (--cible).");
  /** @type {ComponentNode[]} */
  const variantes = [];
  /** @type {TextNode[]} */
  const libellesLies = [];

  for (const type of ["principal", "secondaire"]) {
    for (const etat of ETATS_BOUTON) {
      const inactif = etat === "désactivé" || etat === "chargement";
      const appuye = etat === "survol" || etat === "focus" || etat === "actif";
      const couleur = inactif ? "texte-doux" : appuye ? "accent-fonce" : "accent";
      const c = composant(`type=${type}, état=${etat}`, {
        sens: "HORIZONTAL",
        marge: ["e-3", "e-6"],
        rayon: "pilule",
        axe: "CENTER",
        travers: "CENTER",
        bordure: couleur,
        epaisseur: 2,
      });
      // Le secondaire au repos est transparent, bordé d'accent ; tous les autres états sont pleins
      c.fills = type === "secondaire" && etat === "repos" ? [] : [peinture(couleur)];
      regler(c, "minHeight", "cible");
      const contenu = etat === "chargement" ? CONTENU.messages.chargement : etat === "désactivé" ? MAQUETTE.desactive : "Réserver";
      const libelle = await texte(contenu, {
        style: "t-s/600",
        couleur: type === "secondaire" && etat === "repos" ? "accent" : "blanc",
        nom: "libellé",
      });
      ajouter(c, libelle, "HUG");
      if (!inactif) libellesLies.push(libelle);
      if (etat === "actif") {
        c.effects = [{ type: "INNER_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.25 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: "NORMAL" }];
      }
      if (etat === "focus") anneauDeFocus(c, "pilule");
      c.description = {
        repos: ".action — fond --accent, texte blanc (6,66:1)",
        survol: ".action:hover — --accent-fonce (9,35:1), soulevé d'1 px dans le code",
        focus: ".action:focus-visible — comme le survol + outline 3 px --accent, offset 3 px (6,04:1 sur le fond)",
        actif: ".action:active — enfoncé d'1 px pendant l'appui (translateY dans le code)",
        désactivé: ".action:disabled — fond --texte-doux (7,52:1) ; le libellé dit pourquoi",
        chargement: ".action:disabled pendant l'envoi — « … en cours », pas de double envoi",
      }[etat] || "";
      variantes.push(c);
    }
  }

  const jeu = figma.combineAsVariants(variantes, figma.currentPage);
  jeu.name = "bouton";
  jeu.description = "Composant 1 — .action et .action--secondaire (skillhub.css). Six états par type.";
  const libelle = jeu.addComponentProperty("libellé", "TEXT", "Réserver");
  libellesLies.forEach((t) => (t.componentPropertyReferences = { characters: libelle }));
  arrangerVariantes(jeu, ETATS_BOUTON.length);
  placer(jeu);
  ETAT.composants.bouton = { jeu, libelle };
}

const ETATS_CHAMP = ["repos", "survol", "focus", "rempli", "erreur", "désactivé"];

// Composant 2 : le champ (.champ). L'erreur, c'est une bordure de 2 px ET un message écrit :
// jamais la couleur seule (WCAG 1.4.1).
async function creerChamp() {
  await legende("Champ — 2 types × 6 états", "Libellé toujours visible, bordure --texte-doux (7,52:1), erreur = bordure 2 px + message qui dit quoi faire, saisie conservée.");
  /** @type {ComponentNode[]} */
  const variantes = [];
  /** @type {Array<{libelle: TextNode, aide: TextNode}>} */
  const aLier = [];

  for (const type of ["texte", "liste"]) {
    for (const etat of ETATS_CHAMP) {
      const c = composant(`type=${type}, état=${etat}`, { ecart: "e-1" });
      c.counterAxisSizingMode = "FIXED";
      c.resize(300, c.height);

      const libelle = ajouter(c, await texte(type === "liste" ? CONTENU.inscription.profil : CONTENU.inscription.courriel, { style: "t-s/600", nom: "libellé" }), "FILL");

      const bord = etat === "erreur" ? "erreur" : etat === "survol" ? "texte" : etat === "désactivé" ? "bordure" : "texte-doux";
      const zone = ajouter(
        c,
        cadre("zone de saisie", {
          sens: "HORIZONTAL",
          marge: ["e-2", "e-3"],
          ecart: "e-2",
          travers: "CENTER",
          fond: etat === "désactivé" ? "fond-teinte" : "fond",
          bordure: bord,
          epaisseur: etat === "erreur" ? 2 : 1,
          rayon: "rayon-s",
        }),
        "FILL"
      );
      regler(zone, "minHeight", "cible");
      /** @type {Record<string, string>} */
      const valeurs =
        type === "liste"
          ? { repos: "Choisissez", survol: "Choisissez", focus: "Choisissez", rempli: "En reconversion", erreur: "Choisissez", désactivé: "Choisissez" }
          : { repos: "", survol: "", focus: "Jonny", rempli: MAQUETTE.jonny.nom, erreur: MAQUETTE.jonny.courrielFaute, désactivé: "" };
      ajouter(zone, await texte(valeurs[etat], { couleur: etat === "désactivé" ? "texte-doux" : "texte", nom: "valeur" }), "FILL");
      if (type === "liste") ajouter(zone, icone("chevron"));
      if (etat === "focus") anneauDeFocus(zone, 14);

      if (type === "texte") {
        const aide = ajouter(c, await texte(CONTENU.inscription.aideCourriel, { style: "t-xs/400", couleur: "texte-doux", nom: "aide" }), "FILL");
        aLier.push({ libelle, aide });
      }
      const message = type === "liste" ? "Choisissez votre profil." : CONTENU.messages.courrielInvalide;
      const erreur = ajouter(c, await texte(message, { style: "t-xs/600", couleur: "erreur", nom: "message d'erreur" }), "FILL");
      erreur.visible = etat === "erreur";
      c.description = `.champ — ${etat}${etat === "erreur" ? " : aria-invalid=\"true\", message relié par aria-describedby" : ""}`;
      variantes.push(c);
    }
  }

  const jeu = figma.combineAsVariants(variantes, figma.currentPage);
  jeu.name = "champ";
  jeu.description = "Composant 2 — .champ (skillhub.css). Le type « liste » est le <select> « Je suis ».";
  const libelle = jeu.addComponentProperty("libellé", "TEXT", CONTENU.inscription.courriel);
  const aide = jeu.addComponentProperty("aide", "BOOLEAN", true);
  const texteAide = jeu.addComponentProperty("texte d'aide", "TEXT", CONTENU.inscription.aideCourriel);
  for (const n of aLier) {
    n.libelle.componentPropertyReferences = { characters: libelle };
    n.aide.componentPropertyReferences = { visible: aide, characters: texteAide };
  }
  arrangerVariantes(jeu, ETATS_CHAMP.length);
  placer(jeu);
  ETAT.composants.champ = { jeu, libelle, aide, texteAide };
}

// Les deux ombres de skillhub.css (--ombre-1, --ombre-2)
/** @param {1 | 2} n @returns {DropShadowEffect} */
function ombre(n) {
  const rgb = hexVersRgb(hexDe("texte"));
  return n === 1
    ? { type: "DROP_SHADOW", color: { r: rgb.r, g: rgb.g, b: rgb.b, a: 0.35 }, offset: { x: 0, y: 16 }, radius: 24, spread: -16, visible: true, blendMode: "NORMAL" }
    : { type: "DROP_SHADOW", color: { r: rgb.r, g: rgb.g, b: rgb.b, a: 0.5 }, offset: { x: 0, y: 24 }, radius: 48, spread: -20, visible: true, blendMode: "NORMAL" };
}

// Change le texte d'un calque DANS une instance (une surcharge, comme dans l'éditeur)
/** @param {InstanceNode} inst @param {string} calque @param {string} contenu */
function remplacerTexte(inst, calque, contenu) {
  const t = /** @type {TextNode | null} */ (inst.findOne((n) => n.type === "TEXT" && n.name === calque));
  if (!t) throw new Error(`${inst.name} : pas de calque texte « ${calque} »`);
  t.characters = contenu;
}

/**
 * Une instance de bouton, libellé compris
 * @param {"principal" | "secondaire"} type @param {string} etat @param {string} libelle @param {string} [nom]
 */
function bouton(type, etat, libelle, nom) {
  const b = instance("bouton", { type, "état": etat });
  b.setProperties({ [ETAT.composants.bouton.libelle]: libelle });
  b.name = nom || `bouton ${libelle}`;
  return b;
}

/**
 * Une instance de champ : libellé, aide éventuelle, valeur saisie
 * @param {string} etat @param {string} libelle @param {string | null} aide @param {string} valeurSaisie @param {string} nom
 * @param {string} [message] le message d'erreur, si ce n'est pas celui de l'adresse
 */
function champ(etat, libelle, aide, valeurSaisie, nom, message) {
  const c = instance("champ", { type: "texte", "état": etat });
  const cles = ETAT.composants.champ;
  /** @type {Record<string, string | boolean>} */
  const proprietes = { [cles.libelle]: libelle, [cles.aide]: aide !== null };
  if (aide) proprietes[cles.texteAide] = aide;
  c.setProperties(proprietes);
  remplacerTexte(c, "valeur", valeurSaisie);
  if (message) remplacerTexte(c, "message d'erreur", message);
  c.name = nom;
  return c;
}

// Composant 3 : la carte d'atelier (.atelier). Prix, niveau, durée et date sur la carte :
// Jonny compare avec un budget serré sans ouvrir une autre page (TP 1, étape 2).
// Un composant simple : les variantes décrivent des ÉTATS, les propriétés décrivent du CONTENU.
async function creerCarteAtelier() {
  await legende("Carte d'atelier", "Titre, étiquette, description, infos et prix sont des propriétés de contenu. Le bouton est une instance du composant bouton, aligné en pied de carte (margin-top: auto).");
  const git = CONTENU.ateliers.items[0];
  // Deux blocs et « espace entre » : quand les cartes d'une rangée prennent la même hauteur, les boutons s'alignent
  const c = composant("carte-atelier", { marge: ["e-6"], fond: "fond", bordure: "bordure", rayon: "rayon-m", axe: "SPACE_BETWEEN" });
  c.counterAxisSizingMode = "FIXED";
  c.resize(368, c.height);
  const contenu = ajouter(c, cadre("contenu", { ecart: "e-2" }), "FILL");
  const titre = ajouter(contenu, await texte(git.titre, { style: "t-m/600", nom: "titre" }), "FILL");
  const etiquette = ajouter(contenu, cadre("étiquette", { marge: ["e-1", "e-2"], fond: "accent-clair", rayon: "pilule" }));
  const etiquetteTexte = ajouter(etiquette, await texte(git.etiquette, { style: "t-xs/600", couleur: "accent-fonce", nom: "étiquette" }), "HUG");
  const description = ajouter(contenu, await texte(git.description, { nom: "description" }), "FILL");
  const infos = ajouter(contenu, await texte(git.infos, { style: "t-xs/400", couleur: "texte-doux", nom: "infos" }), "FILL");
  const prix = ajouter(contenu, await texte(git.prix, { style: "t-m/600", nom: "prix" }), "FILL");
  const pied = ajouter(c, cadre("pied de carte", { marge: ["e-2", 0, 0, 0] }), "FILL");
  ajouter(pied, bouton("principal", "repos", "Réserver", "bouton Réserver"));
  c.description = ".atelier — flex en colonne, gap --e-2, padding --e-6, bordure --bordure (décorative : la carte n'est pas interactive)";

  /** @type {Record<string, string>} */
  const proprietes = {};
  /** @type {Array<[string, TextNode]>} */
  const liens = [["titre", titre], ["étiquette", etiquetteTexte], ["description", description], ["infos", infos], ["prix", prix]];
  for (const [nom, noeud] of liens) {
    proprietes[nom] = c.addComponentProperty(nom, "TEXT", noeud.characters);
    noeud.componentPropertyReferences = { characters: proprietes[nom] };
  }
  placer(c);
  ETAT.composants["carte-atelier"] = { composant: c, proprietes };
}

/** @param {{titre: string, etiquette: string, description: string, infos: string, prix: string}} atelier @returns {InstanceNode} */
function carteAtelier(atelier) {
  const { composant: c, proprietes: p } = ETAT.composants["carte-atelier"];
  const carte = /** @type {ComponentNode} */ (c).createInstance();
  carte.setProperties({
    [p["titre"]]: atelier.titre,
    [p["étiquette"]]: atelier.etiquette,
    [p["description"]]: atelier.description,
    [p["infos"]]: atelier.infos,
    [p["prix"]]: atelier.prix,
  });
  carte.name = `carte · ${atelier.titre}`;
  return carte;
}

const ETAPES_MODALE = ["saisie", "erreur", "envoi", "confirmée"];

// Composant 4 : la modale de réservation (<dialog>). Elle reprend l'atelier choisi (heuristique 6),
// garde la saisie en cas d'erreur (heuristique 9) et montre l'envoi en cours (heuristique 1).
async function creerModale() {
  await legende("Modale de réservation — 4 étapes", "Saisie, erreur (la saisie est conservée), envoi (« Réservation en cours… »), confirmée (atelier, date, lieu et adresse repris). Largeur : min(32rem, 100% − 2rem), soit 328 px à 360.");
  const git = CONTENU.ateliers.items[0];
  const jonny = MAQUETTE.jonny;
  /** @type {ComponentNode[]} */
  const variantes = [];

  for (const etape of ETAPES_MODALE) {
    const c = composant(`étape=${etape}`, { ecart: "e-4", marge: ["e-6"], fond: "fond", rayon: "rayon-m" });
    c.counterAxisSizingMode = "FIXED";
    c.resize(328, c.height);
    c.effects = [ombre(2)];
    const entete = ajouter(c, cadre("en-tête", { ecart: "e-2" }), "FILL");
    ajouter(entete, await texte(CONTENU.modale.titre + git.titre, { style: "t-l/600", nom: "titre" }), "FILL");
    ajouter(entete, await texte(recapAtelier(git), { couleur: "texte-doux", nom: "récapitulatif" }), "FILL");

    if (etape === "confirmée") {
      // La confirmation remplace la saisie : role="status", annoncée sans déplacer le focus
      const bloc = ajouter(c, cadre("confirmation", { marge: ["e-3", "e-4"], fond: "succes-fond", rayon: "rayon-s" }), "FILL");
      ajouter(bloc, await texte(confirmationReservation(jonny.prenom, git, jonny.courriel), { style: "t-s/600", couleur: "succes", nom: "message de confirmation" }), "FILL");
      ajouter(c, bouton("principal", "repos", CONTENU.modale.fermer, "bouton Fermer"), "FILL");
    } else {
      ajouter(c, champ("rempli", CONTENU.inscription.nom, null, jonny.nom, "champ nom"), "FILL");
      const etatAdresse = etape === "erreur" ? "erreur" : etape === "saisie" ? "focus" : "rempli";
      const saisie = etape === "envoi" ? jonny.courriel : jonny.courrielFaute;
      ajouter(c, champ(etatAdresse, CONTENU.inscription.courriel, CONTENU.modale.aideCourriel, saisie, "champ adresse"), "FILL");
      // Sous 48em, les boutons du formulaire prennent toute la largeur (.formulaire button { width: 100% })
      const actions = ajouter(c, cadre("actions", { ecart: "e-3" }), "FILL");
      ajouter(actions, bouton("principal", etape === "envoi" ? "chargement" : "repos", CONTENU.modale.confirmer, "bouton Confirmer"), "FILL");
      ajouter(actions, bouton("secondaire", "repos", CONTENU.modale.annuler, "bouton Annuler"), "FILL");
    }
    c.description = {
      saisie: "La modale s'ouvre sur l'atelier choisi ; le focus entre dans la modale (showModal).",
      erreur: "Adresse mal formée : message écrit, bordure 2 px, saisie conservée. Le focus va au premier champ fautif.",
      envoi: "Envoi : le bouton passe à « Réservation en cours… » et se désactive (DELAI_SIMULE = 800 ms).",
      confirmée: "Confirmation : l'atelier, la date, le lieu et l'adresse sont repris ; « Fermer » rend le focus au bouton « Réserver ».",
    }[etape] || "";
    variantes.push(c);
  }

  const jeu = figma.combineAsVariants(variantes, figma.currentPage);
  jeu.name = "modale";
  jeu.description = "Composant 4 — <dialog class=\"modale\"> (index.html), comportement dans skillhub.js.";
  arrangerVariantes(jeu, ETAPES_MODALE.length);
  placer(jeu);
  ETAT.composants.modale = { jeu };
}

// La planche des jetons : ce que l'intégrateur lit en premier (cours, 4.4)
async function creerPlanche() {
  const planche = cadre("planche · jetons", { ecart: "e-12", marge: ["e-12"], fond: "fond", bordure: "bordure", rayon: "rayon-m" });
  ajouter(planche, await texte("SkillHub — design system minimal", { style: "t-2xl/600" }), "HUG");
  ajouter(planche, await texte("Mêmes jetons, mêmes noms que src/css/skillhub.css. Chaque couleur porte ses ratios mesurés (formule WCAG 2.2, docs/fm02-contrastes.md) : 4,5:1 pour le texte, 3:1 pour les composants et le focus.", { couleur: "texte-doux" }), 960);

  const couleurs = ajouter(planche, cadre("couleurs", { sens: "HORIZONTAL", ecart: "e-6", retour: true, ecartLignes: "e-6" }), 1296);
  for (const nom of Object.keys(JETONS.couleurs)) {
    const nuancier = ajouter(couleurs, cadre(`nuancier ${nom}`, { ecart: "e-2" }), 200);
    ajouter(nuancier, cadre("échantillon", { fond: nom, bordure: "bordure", rayon: "rayon-s" }), "FILL", 72);
    ajouter(nuancier, await texte(`--${nom}`, { style: "t-s/600" }), "FILL");
    ajouter(nuancier, await texte(hexDe(nom).toUpperCase(), { style: "t-xs/400", couleur: "texte-doux" }), "FILL");
    ajouter(nuancier, await texte(descriptionCouleur(nom).split(" · ").join("\n"), { style: "t-xs/400" }), "FILL");
  }

  const echelle = ajouter(planche, cadre("échelle typographique", { ecart: "e-3" }), "FILL");
  ajouter(echelle, await texte("Échelle typographique — rapport 1,25 à partir de 1 rem · Sora 400 et 600", { style: "t-m/600" }), "FILL");
  for (const cran of Object.keys(JETONS.typo).reverse()) {
    const px = valeur(cran);
    ajouter(echelle, await texte(`${cran} · ${formaterNombre(px)} px — Reprenez la main`, { style: `${cran}/${px >= 20 ? 600 : 400}` }), "FILL");
  }

  const espace = ajouter(planche, cadre("pas d'espacement", { ecart: "e-3" }), "FILL");
  ajouter(espace, await texte("Pas d'espacement — multiples de 4 px, aucune valeur hors pas", { style: "t-m/600" }), "FILL");
  for (const nom of Object.keys(JETONS.espace)) {
    const ligne = ajouter(espace, cadre(`espace ${nom}`, { sens: "HORIZONTAL", ecart: "e-4", travers: "CENTER" }), "FILL");
    ajouter(ligne, await texte(`${nom} · ${valeur(nom)} px`, { style: "t-xs/600" }), 120);
    const barre = ajouter(ligne, cadre("barre", { fond: "accent", rayon: 2 }), valeur(nom), 16);
    regler(barre, "width", nom);
  }
  placer(planche, 160);
}

// Le rapport de construction, en haut de la page 1 : à recopier si quelque chose a échoué
/** @param {string[]} lignes */
async function ecrireRapport(lignes) {
  await figma.setCurrentPageAsync(ETAT.pages.systeme);
  const t = figma.createText();
  t.fontName = { family: "Inter", style: "Regular" };
  t.characters = ["Rapport du plugin SkillHub — " + new Date().toLocaleString("fr-FR")].concat(lignes).join("\n");
  t.fontSize = 14;
  t.name = "rapport du plugin";
  t.x = 0;
  t.y = -80 - lignes.length * 20;
}

/* ---------- 5. Point d'entrée ---------- */

/**
 * Les étapes, dans l'ordre. Chacune est isolée : un échec est noté au rapport et n'arrête pas les suivantes.
 * @type {Array<[string, keyof Etat["pages"] | null, () => Promise<void>]>}
 */
const ETAPES = [
  ["Polices", null, chargerPolices],
  ["Variables", null, creerVariables],
  ["Styles de texte", null, creerStylesTexte],
  ["Planche des jetons", "systeme", creerPlanche],
  ["Composant bouton", "systeme", creerBouton],
  ["Composant champ", "systeme", creerChamp],
  ["Composant carte d'atelier", "systeme", creerCarteAtelier],
  ["Composant modale", "systeme", creerModale],
];

/** @param {{delaiImagesMs?: number}} [options] @returns {Promise<string[]>} */
async function main(options) {
  ETAT = nouvelEtat(options);
  await figma.loadAllPagesAsync();

  // Le plugin ne supprime jamais rien : il n'accepte qu'un fichier neuf (une page, sans calque)
  const pages = figma.root.children;
  if (pages.length !== 1 || pages[0].children.length > 0) {
    figma.notify("SkillHub : lance le plugin dans un nouveau fichier Figma vide (une seule page, sans calque).", { error: true, timeout: 10000 });
    figma.closePlugin();
    return ["✗ Fichier non vide : rien n'a été construit"];
  }
  ETAT.pages.systeme = pages[0];
  ETAT.pages.systeme.name = "1 · Design system";
  ETAT.pages.landing = figma.createPage();
  ETAT.pages.landing.name = "2 · Landing";
  ETAT.pages.parcours = figma.createPage();
  ETAT.pages.parcours.name = "3 · Parcours de Jonny";

  // L'iframe cachée : elle ne sert qu'à convertir les photos WebP en PNG
  figma.showUI(__html__, { visible: false });

  for (const [nom, page, etape] of ETAPES) {
    try {
      figma.notify(`SkillHub : ${nom}…`, { timeout: 1500 });
      await figma.setCurrentPageAsync(ETAT.pages[page || "systeme"]);
      await etape();
      ETAT.rapport.push(`✓ ${nom}`);
    } catch (erreur) {
      ETAT.rapport.push(`✗ ${nom} : ${erreur instanceof Error ? erreur.message : String(erreur)}`);
      console.error(`SkillHub, étape « ${nom} »`, erreur);
    }
  }

  const echecs = ETAT.rapport.filter((l) => l.startsWith("✗")).length;
  await ecrireRapport(ETAT.rapport);
  await figma.setCurrentPageAsync(ETAT.pages.systeme);
  figma.closePlugin(
    echecs === 0
      ? `SkillHub : ${ETAPES.length} étapes sur ${ETAPES.length} réussies.`
      : `SkillHub : ${echecs} étape(s) en échec. Le détail est en haut de la page 1 (« rapport du plugin »).`
  );
  return ETAT.rapport;
}

// Sous Node (tests), on exporte ; dans Figma, module n'existe pas et on construit.
// @ts-ignore — module n'est déclaré que sous Node
if (typeof module !== "undefined") module.exports = { JETONS, USAGES, MESURES, CONTENU, MAQUETTE, ORDRE_TABULATION, PALIERS, DELAI_ENVOI_MS, hexDe, ratioContraste, formaterRatio, descriptionCouleur, hexVersRgb, recapAtelier, confirmationReservation, main };
else main();
