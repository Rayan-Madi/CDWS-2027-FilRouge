# FM03 — plan d'implémentation

> **Pour l'exécutant :** exécution en ligne (superpowers:executing-plans), tâche par tâche, cases à cocher. Rayan a donné carte blanche le 27/10/2026 : pas d'arrêt entre les tâches, mais chaque tâche se termine par ses tests verts et un commit.

**But :** les trois TP de FM03 sur SkillHub (comportement réécrit, TypeScript strict, catalogue chargé avec ses quatre états).

**Architecture :** modules ES, un point d'entrée `main`, un fichier par responsabilité ; sources `src/ts/` compilées par `tsc` dans `src/js/` (commité). Composants « un état, un `rendre()`, un `majEtat()` », racine reçue en argument, rappels vers l'extérieur.

**Stack :** HTML, CSS, TypeScript 7.0.2 (`tsc`), `node:test`, puppeteer-core 25 sur Edge sans fenêtre, axe-core 4.

**Spec :** `docs/superpowers/specs/2026-10-27-fm03-applications-dynamiques-design.md`

## Contraintes globales

- Aucun framework, aucun outil de construction autre que `tsc`. La page marche servie telle quelle par GitHub Pages.
- Aucune nouvelle couleur dans le `:root` de `src/css/skillhub.css` (test `jetons.test.js` du plugin).
- Tout texte d'interface en français, avec les tournures déjà employées (« … en cours », phrases complètes, pas de code HTTP à l'écran).
- `textContent`, jamais `innerHTML` pour du contenu de données.
- Zéro `any`, zéro `as any`, zéro `@ts-ignore`, zéro `!` de non-nullité dans `src/ts/`.
- Les imports relatifs finissent par `.js`.
- Commits terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Fichiers

| Fichier | Tâche | Rôle |
|---|---|---|
| `package.json`, `package-lock.json`, `.gitignore` | 1 | dépendances de développement, scripts |
| `tests/outils/serveur.js` | 1 | serveur statique de test, pannes à la demande (404, délai) |
| `tests/outils/navigateur.js` | 1 | lance Edge/Chrome sans fenêtre, ouvre la page, aide au clavier et au protocole DevTools |
| `outils/figma-skillhub/tests/fm02/index.html`, `skillhub.js`, `contenu.test.js` | 1 | instantané FM02 pour le plugin |
| `src/js/*.js` (TP 1) | 2-4 | modules écrits à la main |
| `src/index.html`, `src/css/skillhub.css` | 2-4, 7-9 | sous-menu, filtres, états, fiche |
| `tests/e2e/*.test.js` | 2-4, 7-9 | bout en bout |
| `docs/fm03-tp1-*.md` | 5 | annotation, rapport TP 1 |
| `tsconfig.json`, `src/ts/*.ts` | 6 | TP 2 |
| `docs/fm03-tp2-*` | 6 | rapport TP 2, sortie de `tsc` |
| `src/donnees/ateliers.json` | 7 | données |
| `tests/unitaires/*.test.js` | 6-8 | logique pure |
| `docs/fm03-tp3-catalogue.md`, `docs/captures/fm03/` | 10 | rapport TP 3, captures |
| `.github/workflows/verifier.yml` | 11 | intégration continue |
| `README.md`, `docs/README.md`, `docs/revision-oral-ec01.md` | 12 | documentation |

---

### Tâche 1 : outillage de test et instantané FM02

**Fichiers :** créer `package.json` (`"type": "module"`, scripts `build`, `verifier`, `test`, `test:unitaires`, `test:e2e`, `captures`), `tests/outils/serveur.js`, `tests/outils/navigateur.js`, `outils/figma-skillhub/tests/fm02/{index.html,skillhub.js}` ; modifier `outils/figma-skillhub/tests/contenu.test.js`.

**Interfaces produites :**
- `demarrerServeur({ racine }) → Promise<{ url: string, pannes: Map<string, { statut?: number, delai?: number }>, arreter(): Promise<void> }>` : un chemin présent dans `pannes` répond son statut, ou attend `delai` ms avant de servir le fichier.
- `ouvrirNavigateur() → Promise<Browser>` (Edge, sinon Chrome, ou `NAVIGATEUR`) ; `nouvellePage(navigateur, url, { largeur, hauteur }) → Promise<Page>` ; `elementActif(page) → Promise<string>` (description courte de `document.activeElement`) ; `ecouteurs(page, selecteur) → Promise<{ type: string }[]>` (DOMDebugger.getEventListeners).

- [ ] Instantané : `git show 3d96c47:src/index.html` et `:src/js/skillhub.js` vers `tests/fm02/` ; `contenu.test.js` lit ces deux fichiers. `npm test` du plugin : vert.
- [ ] Test de fumée `tests/e2e/page.test.js` : la page se charge, aucune erreur console, `html.js` présent. Vert sur le code FM02 actuel.
- [ ] Commit.

### Tâche 2 : TP 1, modules et menu délégué avec sous-menu

**Fichiers :** créer `src/js/main.js`, `dom.js`, `menu.js`, `navigation-courante.js` ; modifier `src/index.html` (script module, garde de la classe `js`, sous-menu), `src/css/skillhub.css` (sous-menu) ; supprimer `src/js/skillhub.js` une fois tout porté (tâche 4).

**Interfaces :**
- `trouver(racine: ParentNode, selecteur: string, Type: new () => T): T` (lève une `Error` qui nomme le sélecteur).
- `brancherMenu(nav: HTMLElement, { surRaccourci?: (raccourci: string) => void }) → void`.
- `brancherNavigationCourante(liens: HTMLAnchorElement[]) → void`.

**Tests `tests/e2e/menu.test.js` (écrits d'abord, rouges) :**
- 375 px : « Menu » ouvre (`aria-expanded="true"`, liste visible) et referme ; un lien choisi referme ; Échap referme et rend le focus à « Menu » ; un clic hors de l'en-tête referme.
- Sous-menu à 375 et 1280 px : le bouton ouvre, `aria-expanded` suit, Échap ferme le sous-menu d'abord (focus sur son bouton) puis le menu ; le focus qui sort du groupe ferme le sous-menu.
- Un raccourci « Le soir » coche le filtre du soir (TP 1) et referme tout.
- Délégation : la `nav` porte exactement un écouteur `click` ; « Menu » et le bouton du sous-menu, zéro.
- Fermé : aucun écouteur `keydown` ni `click` sur `document` posé par le menu.
- [ ] Rouge, implémentation, vert, commit.

### Tâche 3 : TP 1, validation et envoi

**Fichiers :** créer `src/js/validation.js`, `envoi.js`, `serveur-simule.js`, `inscription.js`.

**Interfaces :**
- `brancherValidation(formulaire: HTMLFormElement) → { toutVerifier(): boolean, effacer(): void }`.
- `envoyer(bouton: HTMLButtonElement, libelleEnCours: string, action: () => Promise<T>) → Promise<T>` (bouton rendu dans `finally`).
- `inscrire(inscription) → Promise<void>`, `reserver(reservation, places) → Promise<void>`, `ErreurServeur` (`raison: "deja-inscrit" | "complet"`), `DELAI_SIMULE = 800`.
- `brancherInscription(formulaire: HTMLFormElement) → void`.

**Tests `tests/e2e/formulaires.test.js` :** envoi vide → messages des quatre champs, focus sur le nom, `aria-invalid="true"`, message relié par `aria-describedby` ; nom « &nbsp;&nbsp; » refusé ; `a@b` refusé, `a@b.fr` accepté ; l'erreur disparaît pendant la saisie ; envoi valide → bouton désactivé, « Inscription en cours… », puis confirmation, bouton rendu ; même adresse une seconde fois → `role="alert"` « Un compte existe déjà… ».
- [ ] Rouge, implémentation, vert, commit.

### Tâche 4 : TP 1, modale et filtre FM02 sortis du DOM

**Fichiers :** créer `src/js/modale.js`, `filtre.js` ; supprimer `src/js/skillhub.js`.

**Interfaces :** `brancherModale(dialog: HTMLDialogElement, liste: HTMLElement) → void` ; `brancherFiltre(filtres: HTMLElement, cartes: HTMLElement[]) → { majEtat(p: Partial<{ soir: boolean, debutant: boolean }>): void }`.

**Tests `tests/e2e/modale.test.js` :** Tab jusqu'à « Réserver », Entrée ouvre, focus dans la modale, Échap ferme, focus rendu ; réservation valide → « Réservation en cours… » puis confirmation, « Fermer » rend le focus ; seconde réservation même adresse → refus ; filtre FM02 : soir, débutants, compteur, message vide.
- [ ] Rouge, implémentation, vert ; toute la suite e2e verte ; commit « TP 1 ».

### Tâche 5 : TP 1, documents

- [ ] `docs/fm03-tp1-code-fm02-annote.md` (code FM02 annoté ligne par ligne).
- [ ] `docs/fm03-tp1-comportement.md` : délégation, état, validation, envoi, parcours clavier relevé, explication du focus à apprendre.
- [ ] Commit.

### Tâche 6 : TP 2, TypeScript strict

**Fichiers :** créer `tsconfig.json`, `src/ts/*.ts` (renommage de `src/js/*.js`), `src/ts/types.ts`, `docs/fm03-tp2-sortie-tsc.txt`, `docs/fm03-tp2-typescript.md`, `tests/unitaires/source.test.js`.

- [ ] Renommer sans corriger ; lancer `tsc` ; enregistrer la sortie brute (modules du TP 1 et `skillhub.js` de FM02).
- [ ] Corriger jusqu'à zéro erreur ; `types.ts` ; `trouver` typé.
- [ ] Test `source.test.js` : aucun `any`, `as any`, `@ts-ignore`, `@ts-expect-error`, ni `!` de non-nullité ; chaque `src/ts/x.ts` a son `src/js/x.js`.
- [ ] `npm run build` puis **la même suite e2e** : verte.
- [ ] Commit « TP 2 ».

### Tâche 7 : TP 3, données, format, filtre pur, chargement

**Fichiers :** `src/donnees/ateliers.json`, `src/ts/format.ts`, `src/ts/filtre.ts` (réécrit en logique pure), `src/ts/api.ts`, `src/ts/attendre-la-fin.ts`, tests unitaires associés.

**Interfaces :**
- `formaterPrix(prix: number): string` (« Gratuit », « 25 € ») ; `formaterDuree(minutes: number): string` (« 3 h », « 2 h 30 ») ; `formaterDate(iso: string): string` (« mercredi 4 novembre, 18 h 30 », heure de Paris) ; `estLeSoir(iso: string): boolean` ; `formaterPlaces(places: number): string` (« Complet », « Plus qu'une place », « Plus que 2 places », « 8 places ») ; `libelleNiveau(n: Niveau): string`.
- `normaliser(texte: string): string` ; `filtrerAteliers(ateliers: readonly Atelier[], criteres: Criteres): Atelier[]` ; `decrireResultat(nombre: number, criteres: Criteres): string` ; `CRITERES_PAR_DEFAUT`.
- `chargerAteliers(signal?: AbortSignal, options?: { url?: string | URL, delaiMax?: number }): Promise<Atelier[]>` ; `estAtelier(valeur: unknown): valeur is Atelier` ; `class ErreurChargement extends Error { raison: "reseau" | "http" | "delai" | "format"; statut: number | undefined }`.
- `attendreLaFin<A extends unknown[]>(fn: (...a: A) => void, delai = 300): ((...a: A) => void) & { annuler(): void; maintenant(...a: A): void }`.
- [ ] Tests unitaires rouges, implémentation, verts, commit.

### Tâche 8 : TP 3, carte et composant catalogue

**Fichiers :** `src/ts/carte.ts`, `src/ts/catalogue.ts`, `src/ts/messages.ts` (phrases d'erreur), `src/index.html` (filtres, zones d'état, cartes de repli), CSS (filtres, fantômes, vide, erreur, carte), `tests/e2e/catalogue.test.js`.

**Interfaces :** `carteAtelier(a: Atelier): HTMLLIElement` ; `monterCatalogue(section: HTMLElement, { surReserver: (a: Atelier) => void, options? }) → { appliquerRaccourci(r: string): void, retirerUnePlace(id: string): void, rendreFocus(id: string): void, atelier(id: string): Atelier | undefined }` ; `messageErreur(e: ErreurChargement): string`.

**Tests :** succès (14 cartes, compteur), recherche sans accents avec anti-rebond, niveau, soir, tri par prix (ordre relevé), vide → « Tout afficher » → focus sur la recherche, 404 → alerte + « Réessayer » → succès + focus sur le titre, hors ligne → alerte, plus d'`aria-busy` ni de fantôme, chargement lent → fantômes + `aria-busy="true"` + « Chargement des ateliers… ».
- [ ] Rouge, implémentation, vert, commit.

### Tâche 9 : TP 3, fiche, raccourcis, parcours clavier, axe

**Fichiers :** `src/ts/modale.ts` (fiche à partir d'un `Atelier`), `src/ts/main.ts`, `src/ts/menu.ts` (raccourcis vers le catalogue), `tests/e2e/clavier.test.js`, `tests/e2e/axe.test.js`, mise à jour de `modale.test.js` et `menu.test.js`.

**Tests :** parcours clavier seul (recherche, niveau, tri, Tab jusqu'à une carte, Entrée, Échap, focus revenu sur la même carte), compteur différent à chaque étape ; réservation qui retire une place, atelier à une place → « Complet », focus sur son titre ; raccourcis du sous-menu ; axe-core : zéro violation dans les quatre états.
- [ ] Rouge, implémentation, vert, commit.

### Tâche 10 : TP 3, captures et rapport

- [ ] `tests/captures.js` : chargement, vide, erreur 404, hors ligne, succès (375 et 1280 px) dans `docs/captures/fm03/`.
- [ ] `docs/fm03-tp3-catalogue.md`.
- [ ] Commit « TP 3 ».

### Tâche 11 : intégration continue

- [ ] `.github/workflows/verifier.yml` : Node 24, `npm ci`, `npm run verifier`, `npm run build` + `git diff --exit-code src/js`, tests unitaires, e2e (Chrome du runner, `--no-sandbox` sous CI), tests du plugin.
- [ ] Commit.

### Tâche 12 : documentation, relecture, publication

- [ ] README, `docs/README.md`, `docs/revision-oral-ec01.md`.
- [ ] Relecture adverse (workflow) ; corrections.
- [ ] Vérification finale complète (verification-before-completion), push, PR, fusion, contrôle de la page en ligne, mémoire.
