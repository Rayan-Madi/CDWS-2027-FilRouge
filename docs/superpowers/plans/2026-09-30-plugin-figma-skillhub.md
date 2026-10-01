# Plugin Figma SkillHub — plan d'implémentation

> **Pour les agents :** SOUS-SKILL REQUIS : superpowers:executing-plans (exécution en ligne, même session que la spec). Les étapes utilisent des cases `- [ ]`.

**But :** un plugin Figma de développement qui construit, dans un fichier vide, le livrable du TP 3 : variables, 4 composants et leurs états, landing aux 3 paliers, cas limites, ordre de tabulation, prototype du parcours de Jonny.

**Architecture :** un seul `code.js` sans étape de construction, en couches (données pures → outils → primitives Figma → constructeurs → `main`). Les données sont exportées vers Node pour les tests ; `main()` tourne de bout en bout sur un simulateur de l'API Figma qui applique ses règles d'exécution. Une iframe cachée (`ui.html`) convertit les WebP en PNG.

**Pile :** JavaScript (ES2020, `// @ts-check` + JSDoc), API Plugin Figma 1.0.0, `node:test`, TypeScript 7 en vérification seule (`noEmit`) avec `@figma/plugin-typings` 1.139.

**Spec :** `docs/superpowers/specs/2026-09-30-maquette-figma-design.md`

## Contraintes globales

- Aucune étape de construction pour lancer le plugin : Figma lit `manifest.json`, `code.js`, `ui.html` tels quels.
- `package.json` : dépendances de **développement** seulement (`typescript`, `@figma/plugin-typings`) ; `node_modules/` ignoré par git.
- Noms des variables = noms des propriétés CSS de `src/css/skillhub.css` sans `--`, rangés en groupes `couleurs/`, `typo/`, `espace/`, `forme/`, avec la syntaxe de code WEB `var(--nom)`.
- Au plus 3 pages ; le plugin ne s'exécute que sur un fichier d'une seule page vide et ne supprime jamais rien.
- `manifest.json` : `"documentAccess": "dynamic-page"` → uniquement les API asynchrones (`setCurrentPageAsync`, `setTextStyleIdAsync`, `getNodeByIdAsync`, `loadAllPagesAsync`).
- Police Sora (`Regular`, `SemiBold`) ; repli Inter si absente.
- Textes réels, identiques à `src/index.html` et `src/js/skillhub.js` (vérifié par test).
- `DELAI_ENVOI_MS = 800` (le `DELAI_SIMULE` de `skillhub.js`) ; l'API stocke `timeout` en millisecondes.
- Paliers 360 / 768 / 1280.
- Commentaires et noms en français, comme le reste du dépôt.

## Fichiers

| Fichier | Rôle |
|---|---|
| `outils/figma-skillhub/manifest.json` | déclaration du plugin (nom, `main`, `ui`, `networkAccess`, `documentAccess`) |
| `outils/figma-skillhub/code.js` | le plugin |
| `outils/figma-skillhub/ui.html` | iframe cachée : WebP → PNG |
| `outils/figma-skillhub/package.json`, `tsconfig.json`, `.gitignore` | outillage de développement |
| `outils/figma-skillhub/README.md` | lancer, ce qui est construit, dépannage |
| `outils/figma-skillhub/tests/jetons.test.js` | jetons == CSS, ratios == `fm02-contrastes.md` |
| `outils/figma-skillhub/tests/contenu.test.js` | contenu == HTML/JS, ordre de tabulation |
| `outils/figma-skillhub/tests/figma-simule.js` | simulateur de l'API |
| `outils/figma-skillhub/tests/construction.test.js` | `main()` de bout en bout |
| `docs/fm02-tp3-guide-figma.md` | guide réécrit + protocole de test |
| `docs/README.md`, `README.md` | le dossier du plugin dans l'architecture |

## Interfaces partagées (exportées par `code.js` vers Node)

```js
JETONS            // { couleurs: {texte:"#12293f",…}, typo: {"t-xs":14,…}, espace: {"e-1":4,…}, forme: {"rayon-s":8,"rayon-m":12,pilule:999,cible:44} }
MESURES           // [{ libelle:"--texte sur --fond", avant:"texte", sur:"fond" }, …]  ("blanc" = #ffffff)
hexDe(nom)                         // → "#rrggbb"
ratioContraste(hexA, hexB)         // → number (formule WCAG 2.2)
formaterRatio(r)                   // → "14,84" (tronqué, virgule)
descriptionCouleur(nom)            // → "sur fond : 6,66:1 · … "
CONTENU           // textes de la page (voir tâche 2)
recapAtelier(atelier)              // → "Niveau débutant · 3 h · en ligne · mercredi 7 octobre, 18 h 30 · 25 €"
confirmationReservation(prenom, atelier, courriel) // → le message de skillhub.js
ORDRE_TABULATION  // { 1280: [{cle, libelle}] × 23, 360: [{cle, libelle}] × 20 }
PALIERS           // { 360: {...}, 768: {...}, 1280: {...} }
DELAI_ENVOI_MS    // 800
main(options?)    // async ; options.delaiImagesMs (défaut 20000)
```

---

### Tâche 1 : outillage, jetons et contrastes

**Fichiers :** créer `manifest.json`, `package.json`, `tsconfig.json`, `.gitignore`, `code.js` (sections données + outils + point d'entrée), `ui.html` (vide fonctionnel), `tests/jetons.test.js`.

- [ ] Écrire `tests/jetons.test.js` :
  - chaque couleur de `JETONS.couleurs` == la variable du `:root` de `skillhub.css` (commentaires retirés, casse ignorée), et chaque couleur du `:root` existe dans `JETONS.couleurs` ;
  - `typo`, `espace`, `forme` == valeurs `rem × 16` du CSS (écart < 0,01), `pilule` == 999 ;
  - pour chaque mesure : la ligne `| ${libelle} | ${formaterRatio(ratioContraste(hexDe(avant), hexDe(sur)))}:1 |` existe dans `docs/fm02-contrastes.md` ;
  - `descriptionCouleur("accent")` contient `6,66:1` et `6,04:1`.
- [ ] `npm test` → ÉCHEC (`code.js` absent).
- [ ] Écrire l'outillage et les sections données/outils de `code.js`.
- [ ] `npm test` → SUCCÈS ; `npm run types` → 0 erreur.
- [ ] Commit « Plugin Figma : jetons et contrastes, vérifiés contre le CSS ».

### Tâche 2 : contenu réel et ordre de tabulation

**Fichiers :** modifier `code.js` (données) ; créer `tests/contenu.test.js`.

- [ ] Écrire `tests/contenu.test.js` : tous les textes de `CONTENU` (accroche, valeurs, ateliers, formateurs, inscription, pied) figurent dans le texte de `index.html` (balises retirées, espaces normalisés) ; les messages (`courrielInvalide`, `nomManquant`, `chargement`) figurent dans `skillhub.js` ; `recapAtelier` et `confirmationReservation` reproduisent les gabarits de `skillhub.js` ; `ORDRE_TABULATION[1280]` compte 23 entrées, `[360]` 20, clés uniques, première `evitement`, dernière `pied-inscription`, `menu` seulement à 360.
- [ ] `npm test` → ÉCHEC.
- [ ] Écrire `CONTENU`, `recapAtelier`, `confirmationReservation`, `ORDRE_TABULATION`, `PALIERS`.
- [ ] `npm test` → SUCCÈS ; `npm run types` → 0.
- [ ] Commit.

### Tâche 3 : simulateur, variables, styles de texte, pages

**Fichiers :** créer `tests/figma-simule.js`, `tests/construction.test.js` ; modifier `code.js` (primitives, `creerVariables`, `creerStylesTexte`, `main`).

Règles du simulateur (erreurs levées comme Figma) : écrire un texte avec une police non chargée ; `layoutSizing* = "FILL"` si le parent n'est pas en auto-layout ; `"HUG"` sur un nœud qui n'est ni texte ni cadre auto-layout ; `layoutPositioning = "ABSOLUTE"` hors auto-layout ; `layoutWrap = "WRAP"` hors `HORIZONTAL` ; `minWidth` hors contexte auto-layout ; `appendChild` dans une instance ; `figma.currentPage = …` (interdit en `dynamic-page`) ; plus de 3 pages ; `setBoundVariable` sur un champ inconnu ; `componentPropertyReferences` vers une propriété inexistante ; `setProperties` avec une clé inconnue ; réaction vers un `destinationId` inexistant.

- [ ] Tests : `main()` sur un fichier vide → 3 pages nommées, 31 variables dans la collection `SkillHub`, chaque couleur décrite avec `:1` et sa syntaxe `var(--nom)`, styles de texte `t-xs/400` … `t-3xl/600`, `closePlugin` appelé ; `main()` sur un fichier non vide → aucune page créée, message « nouveau fichier Figma vide ».
- [ ] ÉCHEC → implémenter → SUCCÈS ; `npm run types` → 0 ; commit.

### Tâche 4 : composants `bouton` et `champ`

- [ ] Tests : jeu `bouton` = 12 variantes `type=… , état=…` (2 × 6), propriété texte `libellé` ; variante `focus` contient `anneau` ; fond de `type=principal, état=repos` lié à `couleurs/accent`, `paddingLeft` lié à `espace/e-6` ; jeu `champ` = 12 variantes (`type` texte/liste × 6 états), propriétés `libellé`, `aide` (booléen), `texte d'aide` ; `état=erreur` contient un texte `erreur` et une bordure de 2 px liée à `couleurs/erreur`.
- [ ] ÉCHEC → implémenter `creerBouton`, `creerChamp` → SUCCÈS ; types ; commit.

### Tâche 5 : `carte-atelier`, `modale`, planche des jetons, cas limites

- [ ] Tests : composant `carte-atelier` avec 5 propriétés texte et une instance de `bouton` ; jeu `modale` à 4 variantes `étape=saisie|erreur|envoi|confirmée` ; `étape=confirmée` contient le message de `confirmationReservation("Jonny", …, "jonny@gmail.com")` ; page 1 contient `planche · jetons` et `cas limites` avec `catalogue vide`, `titre long`, `champ en erreur`.
- [ ] ÉCHEC → implémenter → SUCCÈS ; types ; commit.

### Tâche 6 : landing aux trois paliers, images

- [ ] Tests : page 2 contient les frames `360`, `768`, `1280` de ces largeurs, en auto-layout vertical, avec grille ; 3 instances de `carte-atelier` par frame ; `bouton Menu` seulement à 360 ; liens de navigation à 768 et 1280 ; image d'accroche remplie (simulateur qui répond) ou cadre gris « image : accroche » (simulateur muet, `delaiImagesMs: 10`).
- [ ] ÉCHEC → implémenter `construireLanding(palier, ctx)` (renvoie `{ frame, focusables }`) + `chargerImages` + `ui.html` → SUCCÈS ; types ; commit.

### Tâche 7 : ordre de tabulation

- [ ] Tests : frames `1280 · tabulation` (23 pastilles) et `360 · tabulation` (20 pastilles), pastilles nommées `pastille N`, lien d'évitement visible ; frames `360`/`768`/`1280` sans pastille.
- [ ] ÉCHEC → implémenter `poserTabulation(frame, focusables, ordre)` → SUCCÈS ; types ; commit.

### Tâche 8 : prototype du parcours de Jonny

- [ ] Tests : page 3 contient `Landing 360` et les 5 frames de modale (360 × 800) ; flow « Réserver un atelier le soir » qui part de `Landing 360` ; réaction « Réserver » → `OVERLAY` vers `Modale · saisie` ; `Modale · envoi` : `AFTER_TIMEOUT` 800 → `SWAP` `Modale · confirmée` ; « Annuler » et « Fermer » → `CLOSE`.
- [ ] ÉCHEC → implémenter `construirePrototype(ctx)` → SUCCÈS ; types ; commit.

### Tâche 9 : rapport, documentation

- [ ] `main()` : étapes isolées, rapport final (`figma.notify` + console) ; test : une étape qui lève n'empêche pas les suivantes et figure au rapport.
- [ ] `outils/figma-skillhub/README.md` ; réécrire `docs/fm02-tp3-guide-figma.md` (installer, importer le manifest, lancer, régler l'appareil du prototype, partager ; checklist 4.3 ; protocole de test des deux camarades ; tableau des retours) ; `docs/README.md` et `README.md`.
- [ ] `npm test` + `npm run types` → vert ; commit.

### Tâche 10 : vérification finale

- [ ] `npm test`, `npm run types`, relecture du diff complet, contrôle manuel des textes du guide.
- [ ] Demander à l'étudiant l'autorisation de pousser ; il lance le plugin dans Figma Desktop et renvoie le rapport.

## Note d'exécution

L'exécution se fait en ligne, dans la session qui a écrit la spec (demande « fais tout »). Chaque tâche suit le cycle test en échec → implémentation → test vert → vérification des types → commit. Le code d'implémentation n'est pas recopié dans ce plan : les tests ci-dessus sont le contrat, et le code vit dans `outils/figma-skillhub/`.
