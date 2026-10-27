# FM03 — Applications web dynamiques et interactives : conception

Date : 27/10/2026 · Module BC01-FM03 (C04, C05) · Projet fil rouge SkillHub
Source : le support du module (53 diapositives), TP 1 (diapo 25), TP 2 (diapo 30), TP 3 (diapo 50).

## 1. But

Faire les trois TP de FM03 sur la landing SkillHub, sans framework, et pouvoir défendre chaque ligne devant le jury de l'EC01 :

- **TP 1** : comprendre et réécrire le comportement FM02 (menu délégué avec sous-menu, état hors du DOM, validation au fil de la saisie, envoi).
- **TP 2** : passer ce code en TypeScript strict, relever les vraies erreurs du compilateur.
- **TP 3** : un catalogue d'ateliers chargé depuis un `ateliers.json`, filtrable, avec ses quatre états.

Rien n'existait de FM03 au 27/10/2026 (dépôt, branches, ordinateur vérifiés). Le « menu déroulant » de FM02 est le menu mobile, sans sous-menu.

## 2. Approche retenue

`tsc` seul, sans outil de construction. Sources dans `src/ts/*.ts`, compilées dans `src/js/*.js` (modules ES2022, cartes de sources), et **le JavaScript compilé est commité** : GitHub Pages sert le dépôt tel quel, la page marche sans rien installer.

Écartées : Vite (outil que le cours n'a pas introduit, il faudrait une étape de construction sur GitHub) ; JSDoc + `checkJs` (ne remplit pas « renommez en `.ts` »).

Ordre du cours respecté dans l'historique : un commit par TP. Le TP 1 écrit des **modules JavaScript** à la main ; le TP 2 les renomme en `.ts` et relève ce que dit `tsc` ; le TP 3 n'existe qu'en TypeScript.

## 3. Architecture

```
src/
  index.html              une page ; <script type="module" src="js/main.js">
  donnees/ateliers.json   le catalogue (TP 3)
  ts/                     sources TypeScript (TP 2 et 3)
  js/                     JavaScript : écrit à la main au TP 1, compilé ensuite
tests/
  unitaires/              node:test, sur les modules sans DOM
  e2e/                    puppeteer-core + Edge sans fenêtre, serveur statique local
tsconfig.json             strict
package.json              typescript, puppeteer-core, axe-core (développement seulement)
```

Un seul point d'entrée (`main`), un fichier par responsabilité. Chaque composant reçoit sa racine en argument et prévient par des rappels (cours, 4.1, « une frontière explicite ») :

| Module | Rôle | Dépend de |
|---|---|---|
| `main` | monte chaque composant ; un composant qui plante n'emporte pas les autres | tous |
| `dom` | `trouver(racine, sélecteur, Type)` : le cas `null` et le mauvais type deviennent une erreur claire | — |
| `menu` | menu mobile + sous-menu « Ateliers » : un écouteur délégué sur la `nav`, un état, un `rendre()` | `dom` |
| `validation` | `checkValidity()` puis règles maison, message à côté du champ | `dom` |
| `envoi` | bouton désactivé, « … en cours », puis le résultat ; `finally` retire l'indicateur | — |
| `serveur-simule` | tient le rôle du serveur absent (délai, « déjà inscrit », « complet ») | `types` |
| `inscription` | formulaire « Créer mon compte » | `validation`, `envoi`, `serveur-simule` |
| `modale` | fiche de l'atelier + réservation dans le `<dialog>` | `validation`, `envoi`, `serveur-simule`, `format` |
| `types` | `Niveau`, `Atelier`, `Inscription`, `Reservation`, `Criteres`, `Tri` | — |
| `api` | `chargerAteliers(signal, options)` et la garde `estAtelier` | `types` |
| `filtre` | logique pure : normaliser, filtrer, trier, décrire les critères | `types`, `format` |
| `format` | prix, durée, date (fuseau Europe/Paris), places | `types` |
| `carte` | `carteAtelier(atelier)` : rend un `<li>`, ne l'insère pas | `format` |
| `catalogue` | le composant : un état, `majEtat(Partial)`, un `rendre()` avec un `switch` sur les quatre états | `api`, `filtre`, `carte`, `attendre-la-fin` |
| `attendre-la-fin` | anti-rebond de 300 ms (cours, 5.6) | — |
| `navigation-courante` | `aria-current` sur le lien de la section visible (FM02, inchangé) | — |

Le TP 1 crée `main`, `dom`, `menu`, `validation`, `envoi`, `serveur-simule`, `inscription`, `modale`, `filtre` (version FM02 : soir, débutants), `navigation-courante`. Le TP 3 ajoute le reste et remplace le filtre FM02 par le catalogue.

## 4. TP 1 — comportement

**Annotation.** `docs/fm03-tp1-code-fm02-annote.md` : le `skillhub.js` de FM02 (commit 3d96c47), annoté ligne par ligne.

**Menu délégué, avec sous-menu.** Dans la `nav` : le lien « Ateliers » suivi d'un bouton (motif « disclosure » de l'APG : le lien reste un lien), qui ouvre trois raccourcis : *Tout le catalogue*, *Pour débutants*, *Le soir*. Sans JavaScript, le bouton et le sous-menu n'existent pas à l'écran (ils n'ont de sens qu'avec le filtre).

- **Un seul écouteur de clic** sur la `nav` : `closest("button[aria-controls]")` bascule le panneau visé, `closest("a")` referme tout (et transmet le raccourci par un rappel).
- **État** : `{ menuOuvert: boolean, sousMenuOuvert: string | null }`. Un seul sous-menu ouvert à la fois. `rendre()` est la seule fonction qui écrit `aria-expanded` et `data-ferme`.
- **Échap** referme le sous-menu ouvert (focus sur son bouton), sinon le menu mobile (focus sur « Menu »).
- **Clic dehors** et **focus qui sort** de la `nav` referment tout ; le focus qui quitte un groupe referme son sous-menu.
- Les écouteurs du `document` (Échap, clic dehors) ne vivent que tant qu'un panneau est ouvert : posés avec le `signal` d'un `AbortController`, retirés d'un seul `abort()` (cours, 2.4).

**État hors du DOM.** Plus aucune lecture d'état dans le DOM : `menuOuvert()` qui lisait `aria-expanded` disparaît ; le filtre FM02 lit son état dans une variable, pas dans `.checked` ; `envoi` garde le libellé du bouton dans une fermeture, pas dans `dataset`.

**Validation.** Natif d'abord (`setCustomValidity("")` puis `checkValidity()`), puis deux règles qui bouchent de vrais trous du navigateur :

- un nom fait d'espaces passe `required` → « Indiquez votre prénom et votre nom. » ;
- `a@b` passe `type="email"` → le domaine doit contenir un point.

Messages en français à côté du champ (`aria-describedby`, `aria-invalid`). L'erreur apparaît en quittant le champ, se met à jour pendant la saisie tant qu'elle est affichée, et le focus va au premier champ fautif à l'envoi.

**Envoi.** `preventDefault`, bouton désactivé, « Inscription en cours… » (« Réservation en cours… » dans la modale), puis la confirmation ou une erreur (`role="alert"`). Le serveur simulé refuse une adresse déjà inscrite (le 409 du cours, 5.3). `finally` rend toujours le bouton.

## 5. TP 2 — TypeScript

- `tsconfig.json` : `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `module`/`moduleResolution` `NodeNext` (les imports relatifs doivent finir par `.js`, sinon le navigateur ne les trouve pas : le compilateur l'impose), `types: []`, cartes de sources.
- On renomme **d'abord sans rien corriger** et on garde la vraie sortie de `tsc` (`docs/fm03-tp2-sortie-tsc.txt`) : sur les modules du TP 1, et sur le `skillhub.js` de FM02. Au moins trois erreurs commentées avec le bug qu'elles cachaient.
- `types.ts` : `Niveau = "debutant" | "intermediaire" | "avance"`, `Atelier`, `Inscription`, `Reservation`.
- Sélections du DOM typées par `trouver(racine, sélecteur, HTMLInputElement)` : vérifie à l'exécution et type à la compilation, sans `as`.
- Zéro `any`, zéro `as any`, zéro `@ts-ignore` (vérifié par un test).
- Comportement identique : la **même** suite de bout en bout tourne sur le JS du TP 1 et sur le TS compilé.

## 6. TP 3 — le catalogue

**Données.** `src/donnees/ateliers.json` : 14 ateliers réels pour une reconversion dans le numérique. Champs : `id`, `titre`, `niveau`, `prix` (nombre, 0 = gratuit), `places` (dont des 0 et des 1-2), `formateur` (les trois formateurs de la page), `categorie`, `description`, `prerequis` (le correctif de l'audit Nielsen), `duree` (minutes), `lieu` (« En ligne » ou « Paris »), `date` (ISO avec décalage, novembre 2026 à février 2027). Des titres longs pour les cas limites. Un test vérifie le fichier.

**Chargement.** `chargerAteliers(signal?, { url, delaiMax })` :

- `response.ok` testé (fetch ne rejette pas sur 404/500) ;
- délai maximal de 8 s (`AbortSignal.timeout`, combiné au signal de l'appelant par `AbortSignal.any`) ;
- `AbortError` de l'appelant relancé tel quel : une annulation n'est pas une panne ;
- la réponse est **vérifiée** par `estAtelier` (« le type est une promesse ») ;
- toute panne devient une `ErreurChargement` avec sa `raison` (`reseau`, `http` + statut, `delai`, `format`).

**Composant catalogue.** État unique :

```ts
{ chargement: "en-cours" | "erreur" | "pret", ateliers, erreur, criteres: { recherche, niveau, soir, tri } }
```

`majEtat(Partial<Etat>)` est le seul point d'entrée ; `rendre()` calcule la vue (`chargement`, `erreur`, `vide`, `succes`) et la rend par un `switch` exhaustif (une branche oubliée ne compile pas). Écouteurs délégués : `input`/`change` sur le formulaire de filtres, `click` sur la liste et sur la zone d'état.

- **Recherche** sur le titre, le formateur et la catégorie, sans accents ni casse (« accessibilite » trouve « Accessibilité »), avec un anti-rebond de 300 ms : le compteur n'est annoncé qu'une fois la frappe finie. Entrée applique tout de suite.
- **Niveau** (`select`), **tri** par date, prix croissant, prix décroissant (copie avant `sort`), case **le soir** (heure de Paris ≥ 18 h).
- **Raccourcis** du sous-menu : appliqués par `appliquerRaccourci()`, la frontière du composant.

**Les quatre états.**

| État | À l'écran | Annonce | Focus |
|---|---|---|---|
| Chargement | 3 cartes fantômes (place réservée), `aria-busy="true"` sur la liste | « Chargement des ateliers… » (`role="status"`) | inchangé |
| Vide | « Aucun atelier ne correspond à ces filtres. » + bouton « Tout afficher » | la même phrase, polie | après « Tout afficher » : le champ de recherche |
| Erreur | une phrase selon la raison (jamais le code HTTP, qui part en console) + « Réessayer » | `role="alert"` (inséré) | après « Réessayer » : le titre de la section |
| Succès | les cartes | « 4 ateliers · niveau débutant · le soir · triés par prix croissant » : le texte change à chaque critère, donc il est annoncé à chaque changement | inchangé |

Sans JavaScript (ou si le module ne se charge pas), trois ateliers écrits dans le HTML restent affichés, avec un lien vers le formulaire. La classe `js` n'est posée que si le navigateur gère les modules, et elle est retirée si le script ne se charge pas (`file://`, réseau) : le menu reste alors déplié.

**La fiche.** « Réserver » ouvre le `<dialog>` avec la fiche (formateur, date, durée, lieu, prérequis, places, prix), puis le formulaire. Une réservation retire une place (`{ ...atelier, places: places - 1 }`) ; à 0, la carte affiche « Complet » et son bouton est désactivé. À la fermeture, le focus revient au bouton de la carte, retrouvé par l'identifiant de l'atelier (la carte a pu être reconstruite) ; si l'atelier est devenu complet, il revient sur son titre.

## 7. Tests et preuves

- `npm test` : compilation, tests unitaires, tests de bout en bout.
- **Unitaires** (`node:test`) : `filtre` (accents, niveau, soir, tri sans modifier l'original), `format`, `attendreLaFin` (minuteries simulées), `chargerAteliers` (fetch simulé : 200, 404, 500, panne, délai, annulation, JSON invalide, données de mauvaise forme), `ateliers.json` (au moins 12, identifiants uniques, chaque atelier valide, les trois niveaux, au moins un complet et un gratuit), code source (aucun `any`, aucun `@ts-ignore`).
- **De bout en bout** (Edge sans fenêtre, `puppeteer-core`, serveur statique de test qui sait répondre 404 ou retarder un fichier) :
  - menu et sous-menu à 375 et 1280 px, Échap et focus, clic dehors ; **un seul écouteur de clic** sur la `nav`, zéro sur ses boutons (relevé par le protocole DevTools) ;
  - validation, envoi, « déjà inscrit » ;
  - catalogue : chargement, vide, erreur 404, hors ligne (`setOfflineMode`, comme l'onglet Réseau), « Réessayer » ; aucun `aria-busy` ni carte fantôme restés après une panne ;
  - parcours clavier : filtrer, trier, ouvrir une fiche, revenir ; le compteur change à chaque étape ;
  - axe-core : zéro violation dans chacun des quatre états.
- **Captures** des quatre états, hors ligne et 404 comprises : `docs/captures/fm03/`.
- **Intégration continue** (GitHub Actions) : compilation, JavaScript compilé à jour, tests unitaires et de bout en bout, tests du plugin Figma.

## 8. Ce qui ne bouge pas

- Les jetons de couleur du `:root` : aucun nouveau (le test du plugin Figma les compare à la maquette).
- Le plugin Figma reproduit la page **de fin FM02** : son test de contenu lit désormais un instantané figé de `index.html` et `skillhub.js` au commit 3d96c47 (`outils/figma-skillhub/tests/fm02/`).

## 9. Documents

- `docs/fm03-tp1-comportement.md`, `docs/fm03-tp1-code-fm02-annote.md`
- `docs/fm03-tp2-typescript.md`, `docs/fm03-tp2-sortie-tsc.txt`
- `docs/fm03-tp3-catalogue.md`, `docs/captures/fm03/`
- Mises à jour : `README.md` (stack, lancement par un serveur, architecture, vérifications), `docs/README.md` (section FM03), `docs/revision-oral-ec01.md` (questions FM03, dont la gestion du focus à expliquer sans le code).
- Comme pour FM02, les documents disent ce qu'un assistant de code a fait et ce que Rayan doit refaire lui-même (expliquer le focus à l'oral, rejouer le parcours au clavier).

## 10. Hors périmètre

Vrai back-end et vrai POST (pas de serveur sur GitHub Pages : le module `serveur-simule` tient sa place, avec les mêmes refus) ; recherche côté serveur (le JSON est chargé une fois, le filtre est local) ; React (FM04).
