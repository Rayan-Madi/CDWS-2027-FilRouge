# SkillHub — landing page

Landing page publique de **SkillHub**, la plateforme qui met en relation des apprenants en reconversion et des formateurs indépendants.

Projet fil rouge du bloc **BC01** (CDWFS, RNCP 39608), préparation de l'épreuve **EC01** : FM01 (interfaces front-end), FM02 (ergonomie et accessibilité), FM03 (applications web dynamiques : JavaScript, TypeScript, asynchrone).

**HTML5 · CSS3 · TypeScript compilé en JavaScript natif (modules ES) — sans framework, sans bundler.** Le seul outil est `tsc` ; le JavaScript produit est commité, et la page se sert telle quelle.

**En ligne :** https://rayan-madi.github.io/CDWS-2027-FilRouge/ (GitHub Pages, branche `main`, dossier racine — `index.html` redirige vers `src/`)

## Lancer le projet

Aucune installation pour **voir** la page : servez le dossier `src/` avec n'importe quel serveur statique.

```bash
cd src
python3 -m http.server 8000
# puis http://localhost:8000
```

Ou, avec Node : `npm run servir` (même résultat, sur le port 8000).

> Un serveur est **nécessaire** depuis FM03 : en `file://`, le navigateur refuse de charger les modules et le `ateliers.json`. La page reste alors complète, mais sans JavaScript : menu déplié, trois ateliers écrits dans le HTML.

## Développer

```bash
npm install          # TypeScript, puppeteer-core, axe-core : pour compiler et tester seulement
npm run build        # src/ts/*.ts → src/js/*.js (à commiter)
npm test             # compilation, tests unitaires (node:test), tests de bout en bout (Chrome ou Edge sans fenêtre)
npm run captures     # les captures des quatre états du catalogue → docs/captures/fm03/
```

Les tests de bout en bout utilisent le Chrome ou l'Edge déjà installés (`NAVIGATEUR=<chemin>` pour en imposer un). L'intégration continue (`.github/workflows/verifier.yml`) refait tout à chaque PR et vérifie que `src/js` est bien ce que produit `tsc`.

## Architecture

```
.
├── README.md
├── index.html              redirection vers src/ pour GitHub Pages
├── package.json            outils de développement : TypeScript, tests (rien n'est chargé par la page)
├── tsconfig.json           TypeScript strict : src/ts → src/js
├── docs/                   rapports exportés et documents des TP
├── tests/
│   ├── unitaires/          node:test, sur la logique sans DOM (filtre, format, chargement, données)
│   ├── e2e/                de bout en bout, dans un vrai navigateur sans fenêtre
│   └── outils/             serveur de test qui sait tomber en panne (404, lenteur), pilote du navigateur
├── outils/
│   ├── contrastes.js       mesure des contrastes (formule WCAG)
│   └── figma-skillhub/     plugin Figma : construit la maquette du TP 3 (FM02) avec les mêmes jetons
└── src/
    ├── index.html          la page, une seule
    ├── favicon.svg         icône d'onglet (évite une erreur 404 en console)
    ├── css/skillhub.css    une feuille, mobile-first
    ├── ts/                 le comportement, en TypeScript : un module par responsabilité (main.ts, le point d'entrée)
    ├── js/                 le JavaScript compilé par tsc, celui que la page charge (type="module")
    ├── donnees/            ateliers.json, le catalogue des ateliers, chargé par fetch
    ├── images/             accroche et formateurs en WebP, trois largeurs chacun
    └── polices/            Sora 400 et 600 en woff2 (licence OFL)
```

Séparation des responsabilités : la structure dans le HTML, la présentation dans le CSS, le comportement dans le JavaScript. Aucun attribut `style`, aucun `onclick`.

## Choix techniques

### Structure HTML sémantique (critère C2.1)

- `header`, `nav` principale (avec `aria-label`), `main` unique, `section`, `article`, `footer`. Les trois liens du pied de page restent une simple liste : ce n'est pas une navigation majeure.
- Dans chaque fiche d'atelier, le titre `h3` vient en premier, avant l'étiquette : c'est lui qui ouvre la fiche, dans le code comme à l'écran.
- `div` réservées aux crochets sans sens propre, cinq en tout : `.page` (la grille de page), le bloc texte de l'accroche, la zone où le catalogue insère une panne, le bloc « aucun atelier » (montré ou caché d'un coup) et le contenu de la modale (pour distinguer un clic sur le fond). Les filtres sont un `<form role="search">`.
- Chaque `section` porte un titre `h2` et un `aria-labelledby` qui pointe dessus.
- Les fiches d'atelier, de valeur et de formateur sont des `article` : elles gardent leur sens hors de la page.
- Lien d'évitement « Aller au contenu » en premier élément focusable.
- `lang="fr"`, `meta viewport`, `meta description`, `title` explicite.

Arbre des titres :

```
h1  Reprenez la main sur votre reconversion
  h2  Nos valeurs
    h3  Proximité
    h3  Transparence
    h3  Exigence
  h2  Les ateliers du moment
    h3  un par atelier du catalogue (14, chargés depuis ateliers.json ;
        sans JavaScript, les trois écrits dans la page)
  h2  Nos formateurs
    h3  Sarah Benali
    h3  Thomas Martin
    h3  Aïcha N'Diaye
  h2  Créer mon compte
```

### Jetons de design (FM02, chapitre 3)

Toutes les valeurs sont posées une fois dans `:root`, puis seulement référencées : couleurs avec leur **ratio de contraste mesuré en commentaire**, échelle typographique de **rapport 1,25** (`--t-xs` à `--t-3xl`), **pas d'espacement de 4 px** (`--e-1` à `--e-16`), **deux rayons**, **deux ombres**, une hauteur de cible de 44 px. Aucune valeur brute dans les composants. Les jetons, les composants et leurs états sont présentés dans [`docs/design-system.html`](docs/design-system.html), rendu avec la vraie feuille de style.

La maquette Figma (TP 3) est construite par le plugin [`outils/figma-skillhub/`](outils/figma-skillhub/) : ses variables portent les mêmes noms que ce `:root` (Dev Mode affiche `var(--accent)`), et un test vérifie qu'elles n'ont pas divergé. Mode d'emploi : [`docs/fm02-tp3-guide-figma.md`](docs/fm02-tp3-guide-figma.md).

### Responsive sans framework (critère C1.1)

- **Mobile-first** : le cas téléphone s'écrit sans media query, les paliers s'ajoutent en `min-width`, en `em`.
- Structure de page en `grid-template-areas`.
- Grilles de cartes en `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` : 4, 3, 2 puis 1 colonne pour les ateliers (au plus 3 pour les valeurs et les formateurs, qui ont 3 cartes), sans point de rupture.
- Carte d'atelier en Flexbox colonne, bouton poussé en pied par `margin-top: auto`.
- Titre d'accroche en `clamp()`, paragraphes bornés à `65ch`, tailles en `rem`.
- `box-sizing: border-box`, `img { max-width: 100% }`, `overflow-wrap: break-word`.

| Palier | Largeur | Ce qui change | Pourquoi ici |
|---|---|---|---|
| Téléphone | < 48em (768 px) | Une colonne, menu replié derrière un bouton | Cas le plus contraint, écrit en premier |
| Tablette | ≥ 48em | Navigation en ligne, accroche sur deux colonnes, formulaire sur deux colonnes | C'est la largeur où les quatre liens de navigation tiennent sur une ligne à côté du logo |
| Ordinateur | ≥ 64em (1024 px) | Accroche élargie côté texte, contenu centré sur 72rem | Au-delà, les lignes de l'accroche deviennent trop longues |

Vérifié à 375, 800 et 1280 px : `scrollWidth === innerWidth`, **aucune barre de défilement horizontale**.

### Accessibilité (critère C1.2)

Rapport complet : [`docs/fm02-tp4-accessibilite.md`](docs/fm02-tp4-accessibilite.md).


- Étiquettes `label for` liées à chaque champ des formulaires, filtres compris, `autocomplete`, aide lue avec le champ via `aria-describedby`.
- Messages d'erreur annoncés (`aria-live`), `aria-invalid` sur les champs fautifs, focus renvoyé au premier champ invalide.
- `:focus-visible` sur tout élément interactif ; boutons et champs d'au moins 44 px de haut, cases à cocher de 24 × 24 px (WCAG 2.5.8).
- Menu mobile : vrai `button`, `aria-expanded`, `aria-controls`, fermeture par Échap.
- Modale de réservation en `<dialog>` ouverte par `showModal()` : focus piégé dans la modale tant qu'elle est ouverte, Échap ferme, le focus revient au bouton « Réserver ».
- Boutons d'envoi désactivés pendant l'envoi (« … en cours ») : pas de double envoi.
- Filtres des ateliers dans un `<form role="search">` étiqueté (recherche, niveau, tri, « le soir »), compteur annoncé par `role="status"`, panne par `role="alert"` ; section courante marquée par `aria-current` dans la navigation.
- Icônes SVG décoratives en `aria-hidden="true"` ; texte masqué visuellement sur les boutons « Réserver » pour qu'ils soient distincts au lecteur d'écran.
- `prefers-reduced-motion` respecté.

### Performance

- Police **auto-hébergée**, deux graisses seulement, `font-display: swap`, graisse du titre préchargée (`preload` + `crossorigin`).
- Image d'accroche en **WebP**, trois largeurs (400, 700, 800) (`srcset` / `sizes`), `width` et `height` posés (pas de CLS), `fetchpriority="high"` et **pas** de `loading="lazy"` (c'est elle qui fait le LCP).
- Un seul script, `type="module"` (donc différé) ; un petit script en ligne dans le `head` pose la classe `js` avant la première peinture (pas de flash du menu), seulement si les modules se chargent.
- Le catalogue réserve sa place pendant le chargement (cartes fantômes) : rien ne saute à l'arrivée des données.

### Amélioration progressive

Sans JavaScript, la page reste complète : le menu est déplié, le bouton Menu et le sous-menu n'apparaissent pas, trois ateliers sont écrits dans la page avec un lien vers le formulaire, le formulaire est validé par le navigateur (`required`, `type="email"`). Le JS ne fait qu'enrichir. Si le module ne se charge pas (`file://`, réseau), la classe `js` est retirée : même résultat. La validation côté client est un confort, jamais une sécurité : le serveur devra revalider.

### Comportement, TypeScript, asynchrone (FM03)

- **Modules ES, un seul point d'entrée** (`main.ts`), un fichier par responsabilité ; un composant qui plante n'emporte pas les autres.
- **Composants sans framework** : un état dans une variable, un seul `majEtat()`, un seul `rendre()` ; plus aucun état lu dans le DOM. Écouteurs **délégués** (un seul sur la `nav`, menu et sous-menu compris ; un seul sur le catalogue).
- **TypeScript strict** (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), zéro `any`, zéro `as`, zéro `!` (vérifié par un test). Les sélections du DOM vérifient leur type à l'exécution (`trouver(racine, sélecteur, HTMLInputElement)`).
- **Catalogue chargé par `fetch`** : `response.ok` testé, délai maximal, annulation, réponse vérifiée par une garde de type ; **quatre états** (chargement, vide, erreur, succès), chacun avec son annonce et sa gestion du focus.
- Rapports : [TP 1](docs/fm03-tp1-comportement.md) (et le [code FM02 annoté](docs/fm03-tp1-code-fm02-annote.md)), [TP 2](docs/fm03-tp2-typescript.md), [TP 3](docs/fm03-tp3-catalogue.md).

## Vérifications

- [x] HTML : 0 erreur, 0 avertissement sur le [validateur W3C](https://validator.w3.org/nu/?doc=https%3A%2F%2Frayan-madi.github.io%2FCDWS-2027-FilRouge%2Fsrc%2F) (vnu 26.9.16) — capture : `docs/validateur-w3c.png`
- [x] Trois paliers sans débordement horizontal
- [x] Lighthouse **avant** (mobile, navigation privée, page en ligne) : **Performance 97 · Accessibilité 100 · Bonnes pratiques 100 · SEO 100** — `docs/lighthouse-avant.html`, capture `docs/lighthouse-scores.png`
  - Point relevé : l'image d'accroche servie en 800 px sur mobile (25 Kio gaspillés). Geste : variante 700 px dans `srcset` et `sizes` qui décrit la vraie largeur affichée (marges déduites).
  - TBT 190 ms : la plus longue tâche (242 ms) est « Unattributable » (navigateur, DevTools) ; le JavaScript de la page ne s'exécute qu'en 17 ms.
- [x] Lighthouse **après**, mêmes conditions : **Performance 99** · 100 · 100 · 100 — `docs/lighthouse-apres.html`
- [x] Bilan avant / après : [`docs/tp2-bilan-performance.md`](docs/tp2-bilan-performance.md)
- [x] Textes de remplacement par catégorie : [`docs/textes-alternatifs.md`](docs/textes-alternatifs.md)
- [x] Trois erreurs commentées (TP 1) : [`docs/tp1-erreurs-commentees.md`](docs/tp1-erreurs-commentees.md)
- [x] Rapports Lighthouse accessibilité avant et après exportés dans `docs/` (`lighthouse-a11y-avant.html`, `lighthouse-a11y-apres.html`)
- [x] Rapports Wave avant et après exportés dans `docs/` ([`wave-avant.pdf`](docs/wave-avant.pdf), [`wave-apres.pdf`](docs/wave-apres.pdf)) : 0 erreur, 0 erreur de contraste, 0 alerte dans les deux cas
- [x] Parcours clavier rejoué sur la page en ligne (Tab, Maj+Tab, modale, menu mobile) : [`docs/fm02-tp4-accessibilite.md`](docs/fm02-tp4-accessibilite.md), § 4
- [x] FM03 : `npm test` — TypeScript strict sans erreur, 35 tests unitaires, 52 tests de bout en bout (menu et délégation, validation, envoi, modale, catalogue et ses pannes, parcours clavier, axe-core sans violation dans les quatre états)
- [x] FM03 : captures des quatre états, hors ligne et 404 comprises : [`docs/captures/fm03/`](docs/captures/fm03/)
- [x] Plugin Figma (TP 3) : `cd outils/figma-skillhub && npm install && npm test && npm run types`. Il vérifie que les jetons sont ceux du CSS, que le contenu est celui de la page, et qu'une construction complète passe sur un simulateur de l'API. Les appels à l'API sont vérifiés contre ses types officiels.

## Crédits

- Police [Sora](https://github.com/sora-xor/sora-font) — SIL Open Font License 1.1 (`src/polices/OFL.txt`).
- Contenus (ateliers, formateurs) fictifs, projet pédagogique IMIE Paris.
