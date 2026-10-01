# Plugin Figma « SkillHub — maquette du TP 3 »

Construit, dans un fichier Figma **vide**, le livrable du TP 3 de FM02 (design system minimal et maquette interactive), à partir des **mêmes jetons et du même contenu que la page** (`src/css/skillhub.css`, `src/index.html`, `src/js/skillhub.js`).

Aucune étape de construction : Figma lit `manifest.json`, `code.js` et `ui.html` tels quels.

## Lancer le plugin

1. Installer **Figma Desktop** : les plugins en développement ne tournent pas dans le navigateur.
2. Créer un **nouveau fichier Design vide**. Le plugin refuse un fichier qui contient déjà quelque chose : il ne supprime jamais rien.
3. Clic droit sur le canevas → **Plugins → Development → Import plugin from manifest…** → choisir `outils/figma-skillhub/manifest.json`. À faire une seule fois.
4. Clic droit → **Plugins → Development → SkillHub — maquette du TP 3**.
5. Attendre le message final (quelques dizaines de secondes). Le **rapport du plugin** est écrit en haut de la page 1 : chaque étape y figure avec ✓, ⚠ ou ✗.

Pour relancer après une modification : un nouveau fichier vide, puis étape 4 (Figma relit `code.js` à chaque lancement).

## Ce qu'il construit

| Page | Contenu | Règle du cours (4.3) |
|---|---|---|
| `1 · Design system` | 31 **variables** (collection `SkillHub`) aux noms du CSS, avec leur syntaxe de code `var(--…)` et, pour chaque couleur, ses **ratios mesurés** ; 12 **styles de texte** (10 crans liés aux variables de taille, 2 titres fluides à 768) ; la **planche des jetons** ; les **4 composants** : `bouton` (2 types × 6 états), `champ` (2 types × 6 états), `carte-atelier` (propriétés de contenu), `modale` (4 étapes) ; les **cas limites** (titre de trois lignes, catalogue vide, champs en erreur) | 1 nommer · 4 six états · 5 contenu réel · 6 cas limites · 7 contrastes |
| `2 · Landing` | La page aux paliers **360, 768 et 1280**, entièrement en auto-layout, avec grille de colonnes et **vraies images** ; deux copies `1280 · tabulation` et `360 · tabulation` avec l'**ordre de tabulation numéroté** du lien d'évitement au pied de page | 2 grille · 3 trois paliers · 8 ordre de lecture |
| `3 · Parcours de Jonny` | Le **prototype** du parcours du TP 1 : Landing 360 → « Réserver » → modale (saisie → erreur → corrigée → envoi → confirmée). Flow « Réserver un atelier le soir » | prototype à faire essayer |

Les couleurs, marges, espacements et rayons des composants sont **liés aux variables**, pas recopiés : Dev Mode affiche `var(--accent)`, pas `#0B5CAD`.

## Réglages conseillés

- **Prototype** : page 3, panneau *Prototype* → *Device* : une taille de 360 × 800 (ou un Android de cette largeur). Les écrans de modale font 360 × 800 et portent eux-mêmes leur voile sombre. Un plugin ne peut pas régler le fond d'un overlay.
- **Police** : Sora (Google Fonts) est disponible dans Figma. Si elle manque, le plugin passe en Inter et le signale (⚠).

## Dépannage

| Symptôme | Cause probable | Que faire |
|---|---|---|
| « lance le plugin dans un nouveau fichier Figma vide » | le fichier contient déjà un calque ou plusieurs pages | nouveau fichier |
| ⚠ Images : pas de réponse du réseau | GitHub Pages injoignable | relancer connecté ; les cadres gris gardent la bonne taille en attendant |
| ✗ sur une étape | une règle de Figma que les tests n'ont pas prévue | recopier la ligne du rapport ; les autres étapes ont quand même été construites |
| La modale « envoi » ne passe pas seule à « confirmée » | l'unité de `timeout` (la doc de Figma dit millisecondes) | dans `code.js`, `DELAI_ENVOI_MS` ; ou régler *After delay* à 800 ms dans le panneau *Prototype* |

## Vérifier le code (développement seulement)

```bash
cd outils/figma-skillhub
npm install
npm test          # jetons == CSS, contenu == page, construction complète sur un simulateur de l'API
npm run types     # chaque appel à l'API Figma vérifié contre @figma/plugin-typings
```

- `tests/jetons.test.js` : les jetons du plugin sont ceux du `:root` de `skillhub.css`, et chaque ratio recalculé est celui de `docs/fm02-contrastes.md`.
- `tests/contenu.test.js` : chaque texte de `CONTENU` vient de `index.html` ou de `skillhub.js` (les textes propres à la maquette sont à part, dans `MAQUETTE`) ; l'ordre de tabulation va de 1 à 23 (1280) et de 1 à 20 (360).
- `tests/figma-simule.js` : un simulateur de l'API qui lève les erreurs d'**exécution** de Figma que le typage ne voit pas. Par exemple : police non chargée, `FILL` hors auto-layout, enfant ajouté dans une instance, `width` en écriture, plus de 3 pages.
- `tests/construction.test.js` : `main()` de bout en bout sur ce simulateur.

Le simulateur n'est pas Figma : seul un lancement réel fait foi, et son rapport sert à corriger.

## Organisation de `code.js`

1. **Données** : jetons, mesures de contraste, contenu réel, ordre de tabulation, paliers.
2. **Outils** : formule WCAG, conversions.
3. **Primitives Figma** : `cadre()` (l'auto-layout, c'est Flexbox), `texte()`, `peinture()` et `regler()` (qui lient chaque valeur à sa variable), `ajouter()`.
4. **Constructeurs** : une fonction par étape (`creerVariables`, `creerBouton`, `construireLanding`, `poserTabulation`, `creerPrototype`…).
5. **Point d'entrée** : `main()` enchaîne les étapes, chacune isolée, et écrit le rapport.
