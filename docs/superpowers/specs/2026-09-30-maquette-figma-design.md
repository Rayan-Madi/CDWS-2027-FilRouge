# Spec — Plugin Figma « SkillHub » pour le TP 3 de FM02

**Date :** 30/09/2026 · **Branche :** `fm02-tp3-figma` · **Statut :** validée en séance (partie 1), valeurs par défaut acceptées (partie 2)

## 1. Objectif

Produire le livrable principal du TP 3 (FM02, chapitre 4) : **le fichier Figma partagé**, conforme aux règles du cours (4.3) : noms lisibles, grille, trois paliers 360 / 768 / 1280, six états, contenu réel, cas limites, contrastes vérifiés, ordre de tabulation numéroté, prototype du parcours.

Le fichier est construit par un **plugin Figma de développement** que l'étudiant lance dans son propre compte (Figma Desktop). Le plugin ne remplace pas l'étape 6 du TP (faire jouer le prototype à deux camarades et corriger au moins une chose) : il la rend possible.

## 2. Contraintes

- **Aucune étape de construction** pour lancer le plugin (même règle que le reste du dépôt) : `manifest.json` + `code.js` + `ui.html`, lus tels quels par Figma.
- **Compte Starter possible** : au plus **3 pages** dans le fichier.
- **Mêmes jetons, mêmes noms que `src/css/skillhub.css`**. La source de vérité reste le CSS ; un test vérifie l'égalité.
- `figma.createImage` n'accepte que **PNG, JPEG, GIF** : les photos WebP du site sont converties en PNG par l'iframe du plugin (canvas), puis transmises au code principal.
- Les réglages d'overlay (`overlayBackground`, `overlayPositionType`) sont **en lecture seule** pour un plugin : la frame de modale porte elle-même son voile (`rgba(18, 41, 63, 0.6)`, comme `.modale::backdrop`) et fait la taille de l'écran (360 × 800).
- Police **Sora** 400 (Regular) et 600 (SemiBold), disponible dans Figma (Google Fonts). Si elle manque, repli sur Inter avec un avertissement.

## 3. Le fichier Figma produit

### Page `1 · Design system`

**Variables**, collection `SkillHub`, un seul mode :

| Groupe | Variables | Type |
|---|---|---|
| couleurs | `texte`, `texte-doux`, `fond`, `fond-teinte`, `accent`, `accent-fonce`, `accent-clair`, `erreur`, `succes`, `succes-fond`, `pied-texte`, `bordure` | COLOR |
| typo | `t-xs` 14, `t-s` 16, `t-m` 20, `t-l` 25, `t-xl` 31.25, `t-2xl` 39.06, `t-3xl` 48.83 | FLOAT (px) |
| espace | `e-1` 4, `e-2` 8, `e-3` 12, `e-4` 16, `e-6` 24, `e-8` 32, `e-12` 48, `e-16` 64 | FLOAT (px) |
| forme | `rayon-s` 8, `rayon-m` 12, `pilule` 999, `cible` 44 | FLOAT (px) |

La **description** de chaque couleur reprend ses ratios mesurés (ceux de `docs/fm02-contrastes.md`), par exemple `accent` : « sur fond : 6,66:1 · blanc dessus : 6,66:1 · focus ».

Les variables sont **liées** (`setBoundVariable`, `setBoundVariableForPaint`) aux remplissages, contours, marges internes, espacements et rayons des composants, pas recopiées en valeurs brutes.

**Styles de texte** : un par cran (`t-xs` … `t-3xl`), en 400 et en 600 là où le CSS les emploie.

**Planche des jetons** : nuanciers (nom, hex, ratios), échelle typographique, pas d'espacement.

**Quatre composants** (component sets, variantes nommées `propriété=valeur`) :

| Composant | Propriétés | Détails |
|---|---|---|
| `bouton` | `type` = principal, secondaire · `état` = repos, survol, focus, actif, désactivé, chargement | 12 variantes. Pilule, marge interne `e-3`/`e-6`, hauteur ≥ `cible`. Survol = `accent-fonce` (texte blanc aussi sur le secondaire). Focus = survol + anneau 3 px `accent` décalé de 3 px (cadre englobant, comme `outline-offset`). Actif = décalé d'1 px vers le bas. Désactivé = fond `texte-doux`, libellé qui dit pourquoi (« Complet, liste d'attente ouverte »). Chargement = fond `texte-doux`, libellé « Réservation en cours… ». Propriété texte `libellé`. |
| `champ` | `type` = texte, liste · `état` = repos, survol, focus, rempli, erreur, désactivé | 12 variantes. Libellé 600 au-dessus, zone de saisie ≥ `cible`, bordure 1 px `texte-doux`, rayon `rayon-s`. Survol = bordure `texte`. Focus = anneau 3 px décalé. Erreur = bordure 2 px `erreur` **et** message écrit 600 `erreur` en `t-xs`. Désactivé = fond `fond-teinte`, texte `texte-doux`. Propriétés : texte `libellé`, texte `valeur`, booléen `aide` + texte `texte d'aide`. Le type `liste` porte un chevron. |
| `carte-atelier` | `cas` = normal, titre long | Colonne, espacement `e-2`, marge interne `e-6`, fond `fond`, bordure 1 px `bordure`, rayon `rayon-m`. Titre `t-m` 600, étiquette pilule `accent-fonce` sur `accent-clair`, description, infos `t-xs` `texte-doux`, prix `t-m` 600, instance de `bouton` (« Réserver »). « Titre long » : « Maquetter une page responsive avec Figma, de la grille aux composants » (3 lignes à 360). |
| `modale` | `étape` = saisie, erreur, envoi, confirmée | Largeur 328 (360 − 2 × 16) jusqu'à 512 (32 rem), marge interne `e-6`, rayon `rayon-m`, ombre `ombre-2`. Titre « Réserver : Initiation à Git » (`t-l`), récapitulatif (date, lieu, prix), deux instances de `champ`, boutons « Confirmer la réservation » (principal) et « Annuler » (secondaire). Erreur : champ adresse en erreur, message « L'adresse doit ressembler à nom@exemple.fr », saisie conservée. Envoi : bouton en `chargement`. Confirmée : bloc succès qui reprend l'atelier, la date, le lieu et l'adresse, bouton « Fermer ». |

**Cas limites** (section à part, étiquetée) : carte `titre long` ; **catalogue vide** (section « Les ateliers du moment », deux filtres cochés, message en pointillés « Aucun atelier ne correspond à ces filtres. Décochez-en un pour élargir la recherche. ») ; **champ en erreur** (formulaire d'inscription, adresse invalide).

### Page `2 · Landing`

Trois frames **`360`**, **`768`**, **`1280`**, entièrement en auto-layout, avec une grille de colonnes (360 : 4 colonnes, marge 16, gouttière 16 · 768 : 8 colonnes, marge 32, gouttière 24 · 1280 : 12 colonnes, marge 64, gouttière 24, soit 1152 utiles comme `--largeur-max`).

Contenu **réel**, repris de `src/index.html` : en-tête (logo SkillHub, bouton « Menu » à 360, liens Valeurs · Ateliers · Formateurs · S'inscrire dès 768), accroche (titre, texte, deux boutons, **vraie image**), Nos valeurs (3), Les ateliers du moment (filtres + 3 instances de `carte-atelier` : Initiation à Git 25 €, Maquetter une page avec Figma 35 €, Construire son portfolio Gratuit), Nos formateurs (3 **vraies photos**, citations, appel aux formateurs), Créer mon compte (formulaire : instances de `champ`, case à cocher, lien des conditions, bouton), pied de page.

Comportement par palier, calé sur les media queries : sections en `e-12` à 360, `e-16` dès 768 ; marge `e-4` puis `e-8` ; accroche en 1 colonne à 360, 2 colonnes à 768 et 1280 (1,1fr / 1fr à 1280) ; grilles de cartes à 1, 2 puis 3 colonnes ; formulaire à 1 puis 2 colonnes ; tailles de titres fluides calculées depuis les `clamp()` du CSS.

**Ordre de tabulation** : deux copies, **`1280 · tabulation`** et **`360 · tabulation`**, avec des **pastilles numérotées** (cercle 24 px `erreur`, chiffre blanc 600) posées en position absolue sur chaque élément focalisable, du lien d'évitement (1, rendu visible) au dernier lien du pied de page. Les frames `360` / `768` / `1280` restent sans pastilles.

### Page `3 · Parcours de Jonny`

Prototype à 360 px (Jonny est sur mobile). Flow nommé **« Réserver un atelier le soir »**, qui démarre sur `Landing 360`.

| Écran | Interaction | Destination |
|---|---|---|
| `Landing 360` | clic sur « Réserver » (carte Initiation à Git) | overlay `Modale · saisie` |
| `Modale · saisie` | clic sur « Confirmer la réservation » | swap → `Modale · erreur` (adresse mal tapée : `jonny@gmail` ) |
| `Modale · erreur` | clic sur le champ adresse | swap → `Modale · corrigée` |
| `Modale · corrigée` | clic sur « Confirmer la réservation » | swap → `Modale · envoi` |
| `Modale · envoi` | après 1 200 ms | swap → `Modale · confirmée` |
| `Modale · confirmée` | clic sur « Fermer » | fermer l'overlay |
| toutes les modales | clic sur « Annuler » | fermer l'overlay |

Chaque écran de modale est une frame 360 × 800 (voile + instance de `modale` centrée). `Modale · saisie` et `Modale · corrigée` sont deux instances de `étape=saisie`, champs remplis : adresse `jonny@gmail` (faute de frappe) dans la première, `jonny@gmail.com` dans la seconde. Nom : « Jonny Petit ».

Si Figma refuse une réaction sur un calque d'instance imbriqué, le plugin la pose sur l'instance parente et le signale dans son rapport.

## 4. Architecture du plugin

```
outils/figma-skillhub/
├── manifest.json     api 1.0.0, editorType figma, main code.js, ui ui.html,
│                     networkAccess : https://rayan-madi.github.io
├── code.js           le plugin, un seul fichier, // @ts-check + JSDoc
├── ui.html           iframe cachée : télécharge les WebP, les convertit en PNG (canvas), renvoie les octets
├── README.md         lancer le plugin, ce qu'il construit, dépannage
├── package.json      dépendances de DÉVELOPPEMENT seulement (typescript, @figma/plugin-typings)
├── tsconfig.json     checkJs, noEmit
├── .gitignore        node_modules/
└── tests/
    ├── jetons.test.js      jetons du plugin == :root de skillhub.css ; ratios recalculés == descriptions
    └── contenu.test.js     contenu réel == index.html (titres, prix) ; ordre de tabulation 1 → n sans trou
```

`code.js` est organisé en couches, de haut en bas :

1. **Données** (pures, sans `figma`) : `JETONS`, `RATIOS`, `CONTENU` (textes de `index.html`), `PALIERS`, `ORDRE_TABULATION`, `PARCOURS`. Exportées pour les tests Node (`if (typeof module !== "undefined") module.exports = …`).
2. **Outils** : `ratioContraste(hex1, hex2)` (formule WCAG, même calcul que `outils/contrastes.js`), `hexVersRgb`.
3. **Primitives Figma** : `cadre()` (auto-layout), `texte()`, `lier()` (liaison de variable), `pastille()`.
4. **Construction** : `creerVariables()`, `creerStylesTexte()`, `creerComposants()`, `construireLanding(palier)`, `poserTabulation(frame)`, `construirePrototype()`.
5. **Point d'entrée** `main()`, appelé seulement si `figma` existe. Il crée les 3 pages, enchaîne les étapes, notifie l'avancement (`figma.notify`), écrit un rapport en fin de course et ne ferme le plugin qu'à la fin.

**Relancer le plugin** : le plugin marque ce qu'il crée (`setPluginData("skillhub", "1")`). Au lancement, s'il trouve des pages ou une collection `SkillHub` marquées, il demande confirmation dans l'iframe avant de les remplacer. Il ne touche jamais à ce qu'il n'a pas créé.

**Erreurs** : chaque étape est isolée (try/catch) ; une étape en échec n'empêche pas les suivantes et apparaît dans le rapport final (« 5 étapes sur 6 réussies, voici l'erreur »). Image injoignable → cadre gris légendé « image : accroche » à la bonne taille.

## 5. Vérification

| Quoi | Comment | Qui |
|---|---|---|
| Jetons identiques au CSS, ratios exacts | `node --test outils/figma-skillhub/tests` | automatique |
| Contenu identique à `index.html` | idem | automatique |
| Chaque appel à l'API Figma existe et est bien typé | `npx tsc -p outils/figma-skillhub` (checkJs, noEmit) | automatique |
| Le fichier se construit sans erreur | lancer le plugin dans Figma Desktop sur un fichier vide | **l'étudiant** |
| Relecture visuelle | checklist du 4.3 dans le guide ; optionnel : lecture par le serveur MCP de Figma (`get_screenshot`, `get_variable_defs`) | l'étudiant, puis l'assistant |

## 6. Documentation

- `docs/fm02-tp3-guide-figma.md` : réécrit autour du plugin (installer Figma Desktop, importer le manifest, lancer, partager le fichier), checklist du 4.3, **protocole de test** pour les deux camarades (consigne à lire, ce qu'on observe, ce qu'on ne dit pas), tableau des retours d'essai conservé.
- `docs/README.md` et `README.md` : le dossier `outils/figma-skillhub/` apparaît dans l'architecture.

## 7. Hors périmètre

- Les tests avec les camarades et la correction qui en découle (étape 6 du TP).
- Le partage du fichier (lien de partage Figma), fait par l'étudiant.
- Toute modification de `src/` : le code de la page ne change pas.
- Les maquettes de Mélanie (le parcours du TP 1 est celui de Jonny).

## 8. Risques

| Risque | Parade |
|---|---|
| L'API refuse une réaction sur un calque d'instance | Réaction posée sur l'instance parente, signalée dans le rapport |
| Sora absente | Repli Inter + avertissement |
| Réseau coupé | Cadres gris légendés à la place des images |
| Unité de `AFTER_TIMEOUT` | La documentation de l'API (page *Trigger*) le dit : « timeout and delay are stored in milliseconds ». Valeur dans une seule constante `DELAI_ENVOI_MS = 1200`, citée dans le README en cas de comportement différent |
| Le plugin ne peut pas être testé ici (pas de Figma Desktop côté assistant) | Typage strict contre `@figma/plugin-typings`, étapes isolées, rapport d'erreur précis à recopier |
