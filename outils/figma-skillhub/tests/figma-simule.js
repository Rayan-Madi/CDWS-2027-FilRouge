// Simulateur de l'API Plugin de Figma : juste assez pour faire tourner main() sous Node.
// Le typage (npm run types) vérifie les NOMS et les TYPES ; ce simulateur vérifie les règles
// d'EXÉCUTION que Figma impose et qu'aucun typage ne voit. Chaque règle lève l'erreur que Figma lèverait :
//   - écrire dans un texte dont la police n'est pas chargée ;
//   - FILL sur un enfant hors auto-layout, HUG sur un nœud qui n'est ni texte ni auto-layout ;
//   - ABSOLUTE hors auto-layout, WRAP hors HORIZONTAL, min/max hors contexte auto-layout ;
//   - ajouter ou retirer un enfant dans une instance ;
//   - écrire figma.currentPage (interdit en documentAccess « dynamic-page ») ;
//   - plus de 3 pages (compte Starter) ;
//   - lier une variable à un champ inconnu ou d'un autre type ;
//   - propriété de composant inconnue, définitions lues sur une variante ;
//   - réaction vers un nœud inexistant, overlay vers autre chose qu'une frame de premier niveau ;
//   - couleur SOLID avec une clé « a ».
"use strict";

const CHAMPS_NOEUD = new Set([
  "height", "width", "characters", "itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
  "visible", "cornerRadius", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius",
  "minWidth", "maxWidth", "minHeight", "maxHeight", "counterAxisSpacing", "strokeWeight", "strokeTopWeight",
  "strokeRightWeight", "strokeBottomWeight", "strokeLeftWeight", "opacity", "gridRowGap", "gridColumnGap",
]);
const CHAMPS_TEXTE = new Set(["fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "lineHeight", "paragraphSpacing", "paragraphIndent"]);
const NAVIGATIONS = new Set(["NAVIGATE", "SWAP", "OVERLAY", "SCROLL_TO", "CHANGE_TO"]);
const DECLENCHEURS = new Set(["ON_CLICK", "ON_HOVER", "ON_PRESS", "ON_DRAG", "AFTER_TIMEOUT", "MOUSE_UP", "MOUSE_DOWN", "MOUSE_ENTER", "MOUSE_LEAVE", "ON_KEY_DOWN"]);
const CONTENEURS = new Set(["PAGE", "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "GROUP"]);
const AUTO_LAYOUT = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"]);

function creerSimulateur(options = {}) {
  const reglages = Object.assign(
    {
      polices: [
        { family: "Inter", style: "Regular" },
        { family: "Inter", style: "Semi Bold" },
        { family: "Sora", style: "Regular" },
        { family: "Sora", style: "SemiBold" },
      ],
      limitePages: 3,
      // "ok" : l'iframe renvoie un PNG pour chaque URL ; "muet" : elle ne répond jamais
      images: "ok",
    },
    options
  );

  let compteur = 0;
  const noeuds = new Map();
  const policesChargees = new Set();
  const cle = (f) => `${f.family}|${f.style}`;
  const journal = { notifications: [], fermeture: null, messagesUi: [] };
  const variables = [];
  const collections = [];
  const stylesTexte = [];
  const ecouteursUi = new Set();

  function verifierPolice(noeud, police) {
    if (!policesChargees.has(cle(police))) {
      throw new Error(`in set_characters: Cannot write to node with unloaded font "${police.family} ${police.style}" (${noeud.name})`);
    }
  }

  class Noeud {
    constructor(type) {
      this.id = `${++compteur}:1`;
      this.type = type;
      this.name = type.toLowerCase();
      this.parent = null;
      this.visible = true;
      this.x = 0;
      this.y = 0;
      this._l = 100;
      this._h = 100;
      this.boundVariables = {};
      this.reactions = [];
      this._plugin = {};
      this._refs = null;
      this._sizingH = "FIXED";
      this._sizingV = "FIXED";
      this._positioning = "AUTO";
      noeuds.set(this.id, this);
    }
    get removed() {
      return !noeuds.has(this.id);
    }
    // Dans Figma, width et height sont en lecture seule : on passe par resize()
    get width() {
      return this._l;
    }
    set width(_v) {
      throw new Error(`Cannot assign to read only property 'width' of ${this.name} : utiliser resize()`);
    }
    get height() {
      return this._h;
    }
    set height(_v) {
      throw new Error(`Cannot assign to read only property 'height' of ${this.name} : utiliser resize()`);
    }
    _dansInstance() {
      for (let p = this.parent; p; p = p.parent) if (p.type === "INSTANCE") return true;
      return false;
    }
    _parentAutoLayout() {
      return Boolean(this.parent && AUTO_LAYOUT.has(this.parent.type) && this.parent.layoutMode && this.parent.layoutMode !== "NONE");
    }
    _estAutoLayout() {
      return AUTO_LAYOUT.has(this.type) && this.layoutMode && this.layoutMode !== "NONE";
    }
    remove() {
      if (this._dansInstance()) throw new Error("Cannot remove a child of an instance");
      if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent = null;
      const effacer = (n) => {
        noeuds.delete(n.id);
        (n.children || []).forEach(effacer);
      };
      effacer(this);
    }
    resize(largeur, hauteur) {
      if (!(largeur >= 0.01) || !(hauteur >= 0.01)) throw new Error(`resize: dimensions invalides ${largeur} × ${hauteur} (${this.name})`);
      this._l = largeur;
      this._h = hauteur;
    }
    setPluginData(k, v) {
      this._plugin[k] = v;
    }
    getPluginData(k) {
      return this._plugin[k] || "";
    }
    get absoluteBoundingBox() {
      let x = 0;
      let y = 0;
      for (let n = this; n && n.type !== "PAGE"; n = n.parent) {
        x += n.x;
        y += n.y;
      }
      return { x, y, width: this.width, height: this.height };
    }
    get layoutSizingHorizontal() {
      return this._sizingH;
    }
    set layoutSizingHorizontal(v) {
      this._verifierDimensionnement(v, "horizontal");
      this._sizingH = v;
    }
    get layoutSizingVertical() {
      return this._sizingV;
    }
    set layoutSizingVertical(v) {
      this._verifierDimensionnement(v, "vertical");
      this._sizingV = v;
    }
    _verifierDimensionnement(v, axe) {
      if (v === "FILL" && !this._parentAutoLayout()) {
        throw new Error(`FILL can only be set on children of auto-layout frames (${this.name}, ${axe})`);
      }
      if (v === "HUG" && !(this.type === "TEXT" || this._estAutoLayout())) {
        throw new Error(`HUG can only be set on auto-layout frames and text nodes (${this.name}, ${axe})`);
      }
    }
    get layoutPositioning() {
      return this._positioning;
    }
    set layoutPositioning(v) {
      if (v === "ABSOLUTE" && !this._parentAutoLayout()) throw new Error(`ABSOLUTE positioning requires an auto-layout parent (${this.name})`);
      this._positioning = v;
    }
    get componentPropertyReferences() {
      return this._refs;
    }
    set componentPropertyReferences(refs) {
      let composant = this.parent;
      while (composant && composant.type !== "COMPONENT") composant = composant.parent;
      if (!composant) throw new Error(`componentPropertyReferences: ${this.name} n'est pas dans un composant`);
      const porteur = composant.parent && composant.parent.type === "COMPONENT_SET" ? composant.parent : composant;
      for (const valeur of Object.values(refs || {})) {
        if (!(valeur in porteur._definitions)) throw new Error(`componentPropertyReferences: propriété inconnue « ${valeur} »`);
      }
      this._refs = refs;
    }
    setBoundVariable(champ, variable) {
      const texte = this.type === "TEXT" && CHAMPS_TEXTE.has(champ);
      if (!CHAMPS_NOEUD.has(champ) && !texte) throw new Error(`setBoundVariable: champ inconnu « ${champ} »`);
      if (variable && champ !== "characters" && champ !== "visible" && variable.resolvedType !== "FLOAT") {
        throw new Error(`setBoundVariable: ${champ} attend une variable FLOAT, pas ${variable.resolvedType}`);
      }
      this.boundVariables[champ] = variable ? { type: "VARIABLE_ALIAS", id: variable.id } : undefined;
    }
    async setReactionsAsync(reactions) {
      for (const r of reactions) {
        if (!r.trigger || !DECLENCHEURS.has(r.trigger.type)) throw new Error(`réaction : déclencheur invalide ${JSON.stringify(r.trigger)}`);
        if (r.trigger.type === "AFTER_TIMEOUT" && typeof r.trigger.timeout !== "number") throw new Error("AFTER_TIMEOUT sans timeout");
        if (!Array.isArray(r.actions) || r.actions.length === 0) throw new Error("réaction sans actions");
        for (const a of r.actions) {
          if (a.type !== "NODE") continue;
          if (!NAVIGATIONS.has(a.navigation)) throw new Error(`navigation invalide ${a.navigation}`);
          const cible = noeuds.get(a.destinationId);
          if (!cible) throw new Error(`réaction vers un nœud inexistant ${a.destinationId}`);
          if ((a.navigation === "OVERLAY" || a.navigation === "SWAP") && !(cible.type === "FRAME" && cible.parent && cible.parent.type === "PAGE")) {
            throw new Error(`${a.navigation} vers autre chose qu'une frame de premier niveau (${cible.name})`);
          }
        }
      }
      this.reactions = reactions;
    }
    clone() {
      const copie = cloner(this);
      if (this.parent) this.parent._inserer(this.parent.children.indexOf(this) + 1, copie);
      return copie;
    }
  }

  // Les propriétés de peinture : SOLID n'accepte que r, g, b (l'opacité se règle à part)
  function verifierPeintures(noeud, peintures) {
    for (const p of peintures) {
      if (p.type === "SOLID" && p.color && "a" in p.color) throw new Error(`Invalid SolidPaint on ${noeud.name}: unrecognized key "a" in color`);
      if (p.type === "IMAGE" && !p.imageHash) throw new Error(`IMAGE paint sans imageHash (${noeud.name})`);
    }
  }
  for (const prop of ["fills", "strokes"]) {
    Object.defineProperty(Noeud.prototype, prop, {
      get() {
        return this[`_${prop}`] || [];
      },
      set(v) {
        verifierPeintures(this, v);
        this[`_${prop}`] = v;
      },
    });
  }

  class Conteneur extends Noeud {
    constructor(type) {
      super(type);
      this.children = [];
      this.layoutMode = "NONE";
      this._wrap = "NO_WRAP";
    }
    get layoutWrap() {
      return this._wrap;
    }
    set layoutWrap(v) {
      if (v === "WRAP" && this.layoutMode !== "HORIZONTAL") throw new Error(`WRAP requires layoutMode HORIZONTAL (${this.name})`);
      this._wrap = v;
    }
    _inserer(index, enfant) {
      if (enfant === this) throw new Error("Un nœud ne peut pas se contenir");
      for (let p = this; p; p = p.parent) if (p === enfant) throw new Error("Cycle : un nœud ne peut pas contenir son ancêtre");
      if (this.type === "COMPONENT_SET" && enfant.type !== "COMPONENT") throw new Error("Un jeu de composants ne contient que des composants");
      if (enfant.parent) enfant.parent.children.splice(enfant.parent.children.indexOf(enfant), 1);
      enfant.parent = this;
      this.children.splice(index, 0, enfant);
    }
    appendChild(enfant) {
      if (this.type === "INSTANCE" || this._dansInstance()) throw new Error(`Cannot add children to an instance (${this.name})`);
      this._inserer(this.children.length, enfant);
    }
    insertChild(index, enfant) {
      if (this.type === "INSTANCE" || this._dansInstance()) throw new Error(`Cannot add children to an instance (${this.name})`);
      this._inserer(index, enfant);
    }
    findAll(test) {
      const res = [];
      const parcourir = (n) => {
        for (const e of n.children || []) {
          if (!test || test(e)) res.push(e);
          parcourir(e);
        }
      };
      parcourir(this);
      return res;
    }
    findOne(test) {
      return this.findAll(test)[0] || null;
    }
    findChildren(test) {
      return this.children.filter((e) => !test || test(e));
    }
  }
  // min/max : sur un cadre auto-layout, ou sur l'enfant d'un cadre auto-layout
  for (const prop of ["minWidth", "maxWidth", "minHeight", "maxHeight"]) {
    Object.defineProperty(Noeud.prototype, prop, {
      get() {
        return this[`_${prop}`] === undefined ? null : this[`_${prop}`];
      },
      set(v) {
        if (v !== null && !(this._estAutoLayout() || this._parentAutoLayout())) {
          throw new Error(`${prop} only applies to auto-layout frames and their children (${this.name})`);
        }
        this[`_${prop}`] = v;
      },
    });
  }

  class Texte extends Noeud {
    constructor() {
      super("TEXT");
      this._police = { family: "Inter", style: "Regular" };
      this._caracteres = "";
      this.textStyleId = "";
      this._taille = 12;
    }
    get fontName() {
      return this._police;
    }
    set fontName(police) {
      verifierPolice(this, police);
      this._police = police;
    }
    get characters() {
      return this._caracteres;
    }
    set characters(v) {
      verifierPolice(this, this._police);
      this._caracteres = String(v);
    }
    get fontSize() {
      return this._taille;
    }
    set fontSize(v) {
      verifierPolice(this, this._police);
      this._taille = v;
    }
    async setTextStyleIdAsync(id) {
      const style = stylesTexte.find((s) => s.id === id);
      if (!style) throw new Error(`Style de texte inconnu ${id}`);
      verifierPolice(this, style.fontName);
      this.textStyleId = id;
      this._police = style.fontName;
      this._taille = style.fontSize;
    }
  }
  // Toute écriture de mise en forme exige la police chargée, comme dans Figma
  for (const prop of ["lineHeight", "letterSpacing", "textAutoResize", "textAlignHorizontal", "textAlignVertical", "textDecoration", "textCase"]) {
    Object.defineProperty(Texte.prototype, prop, {
      get() {
        return this[`_${prop}`];
      },
      set(v) {
        verifierPolice(this, this._police);
        this[`_${prop}`] = v;
      },
    });
  }

  function definitionsDe(porteur) {
    if (porteur.type === "COMPONENT" && porteur.parent && porteur.parent.type === "COMPONENT_SET") {
      throw new Error("in get_componentPropertyDefinitions: Can only get definitions of a component set or non-variant component");
    }
    const defs = {};
    for (const [k, v] of Object.entries(porteur._definitions)) defs[k] = v;
    if (porteur.type === "COMPONENT_SET") {
      for (const [nom, valeurs] of Object.entries(porteur._variantes())) defs[nom] = { type: "VARIANT", defaultValue: valeurs[0], variantOptions: valeurs };
    }
    return defs;
  }

  class Composant extends Conteneur {
    constructor() {
      super("COMPONENT");
      this._definitions = {};
      this.description = "";
    }
    get componentPropertyDefinitions() {
      return definitionsDe(this);
    }
    get variantProperties() {
      if (!this.parent || this.parent.type !== "COMPONENT_SET") return null;
      return lireNomDeVariante(this.name);
    }
    addComponentProperty(nom, type, defaut) {
      if (this.parent && this.parent.type === "COMPONENT_SET") throw new Error("addComponentProperty: à poser sur le jeu de composants, pas sur une variante");
      return ajouterPropriete(this, nom, type, defaut);
    }
    createInstance() {
      const instance = new Instance(this);
      return instance;
    }
  }

  class JeuDeComposants extends Conteneur {
    constructor() {
      super("COMPONENT_SET");
      this._definitions = {};
      this.description = "";
    }
    get componentPropertyDefinitions() {
      return definitionsDe(this);
    }
    get defaultVariant() {
      return this.children[0];
    }
    _variantes() {
      const res = {};
      for (const v of this.children) {
        for (const [k, val] of Object.entries(lireNomDeVariante(v.name))) {
          res[k] = res[k] || [];
          if (res[k].indexOf(val) === -1) res[k].push(val);
        }
      }
      return res;
    }
    addComponentProperty(nom, type, defaut) {
      return ajouterPropriete(this, nom, type, defaut);
    }
  }

  function ajouterPropriete(porteur, nom, type, defaut) {
    if (type === "VARIANT") throw new Error("addComponentProperty: les variantes se créent avec combineAsVariants");
    if (type === "TEXT" && typeof defaut !== "string") throw new Error("Propriété TEXT : valeur par défaut texte attendue");
    if (type === "BOOLEAN" && typeof defaut !== "boolean") throw new Error("Propriété BOOLEAN : valeur par défaut booléenne attendue");
    const nomComplet = `${nom}#${++compteur}:0`;
    porteur._definitions[nomComplet] = { type, defaultValue: defaut };
    return nomComplet;
  }

  function lireNomDeVariante(nom) {
    const res = {};
    for (const morceau of nom.split(",")) {
      const [k, v] = morceau.split("=").map((s) => (s || "").trim());
      if (!k || !v) throw new Error(`Nom de variante invalide « ${nom} » : attendu « propriété=valeur, … »`);
      res[k] = v;
    }
    return res;
  }

  class Instance extends Conteneur {
    constructor(principal, sansEnfants) {
      super("INSTANCE");
      this._principal = principal;
      if (!sansEnfants) this._copierDepuis(principal);
    }
    get mainComponent() {
      return this._principal;
    }
    async getMainComponentAsync() {
      return this._principal;
    }
    _copierDepuis(principal) {
      for (const e of this.children.slice()) {
        e.parent = null;
        noeuds.delete(e.id);
      }
      this.children = [];
      copierProprietes(principal, this, ["name", "type", "x", "y", "parent", "children", "reactions"]);
      for (const e of principal.children) this._inserer(this.children.length, cloner(e));
      this.name = principal.parent && principal.parent.type === "COMPONENT_SET" ? principal.parent.name : principal.name;
    }
    get componentProperties() {
      return this._principal.parent && this._principal.parent.type === "COMPONENT_SET" ? this._principal.variantProperties : {};
    }
    setProperties(proprietes) {
      const principal = this._principal;
      const porteur = principal.parent && principal.parent.type === "COMPONENT_SET" ? principal.parent : principal;
      const defs = definitionsDe(porteur);
      const variantes = {};
      for (const [k, v] of Object.entries(proprietes)) {
        if (!(k in defs)) throw new Error(`setProperties: propriété inconnue « ${k} » sur ${porteur.name}`);
        if (defs[k].type === "VARIANT") variantes[k] = v;
      }
      if (Object.keys(variantes).length > 0) {
        const voulu = Object.assign({}, principal.variantProperties, variantes);
        const cible = porteur.children.find((c) => Object.entries(voulu).every(([k, v]) => c.variantProperties[k] === v));
        if (!cible) throw new Error(`setProperties: aucune variante ${JSON.stringify(voulu)}`);
        const largeur = this.width;
        this._principal = cible;
        const parent = this.parent;
        this._copierDepuis(cible);
        this.parent = parent;
        this._l = largeur;
      }
      for (const [k, v] of Object.entries(proprietes)) {
        if (defs[k].type === "VARIANT") continue;
        for (const n of this.findAll((n) => n.componentPropertyReferences)) {
          const refs = n.componentPropertyReferences;
          if (refs.characters === k) n.characters = v;
          if (refs.visible === k) n.visible = v;
        }
      }
    }
  }

  function copierProprietes(source, cible, exclues) {
    for (const k of Object.keys(source)) {
      if (k === "id" || k === "_plugin" || exclues.indexOf(k) !== -1) continue;
      if (k === "_definitions" || k === "_principal") continue;
      const v = source[k];
      cible[k] = v && typeof v === "object" && !Array.isArray(v) ? Object.assign({}, v) : Array.isArray(v) ? v.slice() : v;
    }
  }

  function cloner(n) {
    let copie;
    // Une instance clonée garde ses surcharges : on recopie SES enfants, pas ceux du composant
    if (n.type === "INSTANCE") copie = new Instance(n._principal, true);
    else if (n.type === "TEXT") copie = new Texte();
    else if (n.type === "COMPONENT") copie = new Conteneur("FRAME");
    else if (CONTENEURS.has(n.type)) copie = new Conteneur(n.type);
    else copie = new Noeud(n.type);
    copierProprietes(n, copie, ["parent", "children", "type"]);
    if (n.children) for (const e of n.children) copie._inserer(copie.children.length, cloner(e));
    return copie;
  }

  // ---------- Pages, variables, styles ----------
  class Page extends Conteneur {
    constructor(nom) {
      super("PAGE");
      this.name = nom;
      this._flows = [];
    }
    async loadAsync() {}
    get flowStartingPoints() {
      return this._flows;
    }
    set flowStartingPoints(points) {
      for (const p of points) {
        const n = noeuds.get(p.nodeId);
        if (!n || n.parent !== this || n.type !== "FRAME") throw new Error(`flowStartingPoints : ${p.nodeId} n'est pas une frame de premier niveau de ${this.name}`);
      }
      this._flows = points;
    }
  }
  // Les pages ne se réglent pas en auto-layout
  Object.defineProperty(Page.prototype, "layoutMode", { get: () => "NONE", set() {} });

  const racine = { type: "DOCUMENT", name: "Fichier de test", children: [new Page("Page 1")] };
  racine.children[0].parent = racine;
  let pageCourante = racine.children[0];

  const api = {
    editorType: "figma",
    mixed: Symbol("mixed"),
    root: racine,
    get currentPage() {
      return pageCourante;
    },
    set currentPage(_page) {
      throw new Error('Setting figma.currentPage is not supported with "documentAccess": "dynamic-page". Use figma.setCurrentPageAsync.');
    },
    async setCurrentPageAsync(page) {
      pageCourante = page;
    },
    async loadAllPagesAsync() {},
    async getNodeByIdAsync(id) {
      return noeuds.get(id) || null;
    },
    createPage() {
      if (racine.children.length >= reglages.limitePages) throw new Error(`Le compte ne permet que ${reglages.limitePages} pages par fichier`);
      const p = new Page("Page");
      p.parent = racine;
      racine.children.push(p);
      return p;
    },
    createFrame() {
      const f = new Conteneur("FRAME");
      f.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      f.clipsContent = true;
      pageCourante.appendChild(f);
      return f;
    },
    createComponent() {
      const c = new Composant();
      pageCourante.appendChild(c);
      return c;
    },
    createRectangle() {
      const r = new Noeud("RECTANGLE");
      pageCourante.appendChild(r);
      return r;
    },
    createEllipse() {
      const e = new Noeud("ELLIPSE");
      pageCourante.appendChild(e);
      return e;
    },
    createText() {
      const t = new Texte();
      pageCourante.appendChild(t);
      return t;
    },
    createNodeFromSvg(svg) {
      if (!/^<svg[\s>]/.test(svg)) throw new Error("createNodeFromSvg : SVG invalide");
      const f = new Conteneur("FRAME");
      const largeur = Number((svg.match(/width="(\d+)"/) || [])[1] || 24);
      const hauteur = Number((svg.match(/height="(\d+)"/) || [])[1] || 24);
      f._l = largeur;
      f._h = hauteur;
      f._inserer(0, new Noeud("VECTOR"));
      pageCourante.appendChild(f);
      return f;
    },
    createImage(octets) {
      if (!(octets instanceof Uint8Array)) throw new Error("createImage attend un Uint8Array");
      return { hash: `image-${++compteur}` };
    },
    createTextStyle() {
      const style = {
        id: `S:${++compteur}`,
        type: "TEXT",
        name: "",
        description: "",
        boundVariables: {},
        _police: { family: "Inter", style: "Regular" },
        fontSize: 12,
        lineHeight: { unit: "AUTO" },
        get fontName() {
          return this._police;
        },
        set fontName(police) {
          verifierPolice({ name: `style ${this.name}` }, police);
          this._police = police;
        },
        setBoundVariable(champ, variable) {
          if (!CHAMPS_TEXTE.has(champ)) throw new Error(`style : champ inconnu ${champ}`);
          this.boundVariables[champ] = { type: "VARIABLE_ALIAS", id: variable.id };
        },
      };
      stylesTexte.push(style);
      return style;
    },
    async getLocalTextStylesAsync() {
      return stylesTexte.slice();
    },
    combineAsVariants(composants, parent) {
      if (composants.length === 0) throw new Error("combineAsVariants : liste vide");
      const noms = new Set();
      for (const c of composants) {
        if (c.type !== "COMPONENT") throw new Error("combineAsVariants n'accepte que des composants");
        lireNomDeVariante(c.name);
        if (noms.has(c.name)) throw new Error(`Deux variantes portent le même nom : ${c.name}`);
        noms.add(c.name);
      }
      const jeu = new JeuDeComposants();
      parent.appendChild(jeu);
      for (const c of composants) jeu._inserer(jeu.children.length, c);
      return jeu;
    },
    async loadFontAsync(police) {
      if (!reglages.polices.some((p) => cle(p) === cle(police))) throw new Error(`Font "${police.family} ${police.style}" is not available`);
      policesChargees.add(cle(police));
    },
    async listAvailableFontsAsync() {
      return reglages.polices.map((fontName) => ({ fontName }));
    },
    notify(message, opts) {
      journal.notifications.push({ message, opts });
      return { cancel() {} };
    },
    closePlugin(message) {
      journal.fermeture = message === undefined ? "" : message;
    },
    showUI() {},
    ui: {
      postMessage(message) {
        journal.messagesUi.push(message);
        if (message.type === "charger-images" && reglages.images === "ok") {
          const resultats = message.urls.map((url) => ({ url, octets: new Uint8Array([137, 80, 78, 71]) }));
          setTimeout(() => ecouteursUi.forEach((f) => f({ type: "images", resultats })), 5);
        }
      },
      on(type, f) {
        if (type === "message") ecouteursUi.add(f);
      },
      off(type, f) {
        if (type === "message") ecouteursUi.delete(f);
      },
      once(type, f) {
        const g = (m) => {
          ecouteursUi.delete(g);
          f(m);
        };
        if (type === "message") ecouteursUi.add(g);
      },
    },
    variables: {
      createVariableCollection(nom) {
        const collection = {
          id: `VariableCollectionId:${++compteur}`,
          name: nom,
          modes: [{ modeId: `${++compteur}:0`, name: "Mode 1" }],
          variableIds: [],
          renameMode(modeId, nouveau) {
            const m = this.modes.find((x) => x.modeId === modeId);
            if (!m) throw new Error("renameMode : mode inconnu");
            m.name = nouveau;
          },
        };
        collections.push(collection);
        return collection;
      },
      createVariable(nom, collection, type) {
        if (typeof collection !== "object" || !collection.modes) throw new Error("createVariable attend l'objet collection");
        if (variables.some((v) => v.name === nom && v.variableCollectionId === collection.id)) throw new Error(`Variable en double : ${nom}`);
        const variable = {
          id: `VariableID:${++compteur}`,
          name: nom,
          resolvedType: type,
          variableCollectionId: collection.id,
          description: "",
          valuesByMode: {},
          codeSyntax: {},
          scopes: ["ALL_SCOPES"],
          setValueForMode(modeId, valeur) {
            if (!collection.modes.some((m) => m.modeId === modeId)) throw new Error("setValueForMode : mode inconnu");
            if (type === "FLOAT" && typeof valeur !== "number") throw new Error(`${nom} : nombre attendu`);
            if (type === "COLOR" && (typeof valeur !== "object" || !("r" in valeur))) throw new Error(`${nom} : couleur attendue`);
            this.valuesByMode[modeId] = valeur;
          },
          setVariableCodeSyntax(plateforme, valeur) {
            this.codeSyntax[plateforme] = valeur;
          },
        };
        collection.variableIds.push(variable.id);
        variables.push(variable);
        return variable;
      },
      setBoundVariableForPaint(peinture, champ, variable) {
        if (peinture.type !== "SOLID" || champ !== "color") throw new Error("setBoundVariableForPaint : SOLID et « color » seulement");
        if (variable.resolvedType !== "COLOR") throw new Error(`setBoundVariableForPaint : variable COLOR attendue, pas ${variable.resolvedType}`);
        return Object.assign({}, peinture, { boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id } } });
      },
      async getLocalVariablesAsync() {
        return variables.slice();
      },
      async getLocalVariableCollectionsAsync() {
        return collections.slice();
      },
      async getVariableByIdAsync(id) {
        return variables.find((v) => v.id === id) || null;
      },
    },
  };

  return { figma: api, journal, noeuds, variables, collections, stylesTexte };
}

module.exports = { creerSimulateur };
