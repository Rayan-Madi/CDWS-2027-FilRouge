# SkillHub — landing page

Landing page publique de **SkillHub**, la plateforme qui met en relation des apprenants en reconversion et des formateurs indépendants.

Projet fil rouge du module **BC01-FM01 — Développement d'interfaces Front-end** (CDWFS, RNCP 39608), préparation de l'épreuve **EC01**.

**HTML5 · CSS3 · JavaScript natif — sans framework, sans outil de construction.**

**En ligne :** https://rayan-madi.github.io/CDWS-2027-FilRouge/ (GitHub Pages, branche `main`, dossier racine — `index.html` redirige vers `src/`)

## Lancer le projet

Aucune installation. Servez le dossier `src/` avec n'importe quel serveur statique :

```bash
cd src
python3 -m http.server 8000
# puis http://localhost:8000
```

> Ouvrir `index.html` directement en `file://` marche aussi, mais le navigateur refuse alors le préchargement de la police (CORS) : passez par un serveur pour mesurer avec Lighthouse.

## Architecture

```
.
├── README.md
├── index.html              redirection vers src/ pour GitHub Pages
├── docs/                   rapports Lighthouse / Wave exportés (à déposer)
└── src/
    ├── index.html          la page, une seule
    ├── css/skillhub.css    une feuille, mobile-first
    ├── js/skillhub.js      comportement, chargé en defer
    ├── images/             accroche en WebP, deux largeurs
    └── polices/            Sora 400 et 600 en woff2 (licence OFL)
```

Séparation des responsabilités : la structure dans le HTML, la présentation dans le CSS, le comportement dans le JavaScript. Aucun attribut `style`, aucun `onclick`.

## Choix techniques

### Structure HTML sémantique (critère C2.1)

- `header`, `nav` principale (avec `aria-label`), `main` unique, `section`, `article`, `footer`. Les trois liens du pied de page restent une simple liste : ce n'est pas une navigation majeure.
- Dans chaque fiche, le titre `h3` vient en premier : c'est lui qui ouvre la fiche, dans le code comme à l'écran.
- `div` réservées aux crochets de style (`.page`, texte de l'accroche, pastilles décoratives des formateurs).
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
    h3  Initiation à Git
    h3  Maquetter une page avec Figma
    h3  Construire son portfolio
  h2  Nos formateurs
    h3  Sarah Benali
    h3  Thomas Martin
    h3  Aïcha N'Diaye
  h2  Créer mon compte
```

### Responsive sans framework (critère C1.1)

- **Mobile-first** : le cas téléphone s'écrit sans media query, les paliers s'ajoutent en `min-width`, en `em`.
- Structure de page en `grid-template-areas`.
- Grilles de cartes en `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` : 3, 2 puis 1 colonne sans point de rupture.
- Carte d'atelier en Flexbox colonne, bouton poussé en pied par `margin-top: auto`.
- Titre d'accroche en `clamp()`, paragraphes bornés à `65ch`, tailles en `rem`.
- `box-sizing: border-box`, `img { max-width: 100% }`, `overflow-wrap: break-word`.

| Palier | Largeur | Ce qui change | Pourquoi ici |
|---|---|---|---|
| Téléphone | < 48em (768 px) | Une colonne, menu replié derrière un bouton | Cas le plus contraint, écrit en premier |
| Tablette | ≥ 48em | Navigation en ligne, accroche sur deux colonnes, formulaire sur deux colonnes | C'est la largeur où les quatre liens de navigation tiennent sur une ligne à côté du logo |
| Ordinateur | ≥ 64em (1024 px) | Accroche élargie côté texte, contenu centré sur 72rem | Au-delà, les lignes de l'accroche deviennent trop longues |

Vérifié à 375, 800 et 1280 px : `scrollWidth === innerWidth`, **aucune barre de défilement horizontale**.

### Accessibilité (critère C1.2, amorcé)

- Étiquettes `label for` liées à chaque champ, `autocomplete`, aide lue avec le champ via `aria-describedby`.
- Messages d'erreur annoncés (`aria-live`), `aria-invalid` sur les champs fautifs, focus renvoyé au premier champ invalide.
- `:focus-visible` sur tout élément interactif ; cibles de clic d'au moins 44 px.
- Menu mobile : vrai `button`, `aria-expanded`, `aria-controls`, fermeture par Échap.
- Icônes SVG décoratives en `aria-hidden="true"` ; texte masqué visuellement sur les boutons « Réserver » pour qu'ils soient distincts au lecteur d'écran.
- `prefers-reduced-motion` respecté.

### Performance

- Police **auto-hébergée**, deux graisses seulement, `font-display: swap`, graisse du titre préchargée (`preload` + `crossorigin`).
- Image d'accroche en **WebP**, deux largeurs (`srcset` / `sizes`), `width` et `height` posés (pas de CLS), `fetchpriority="high"` et **pas** de `loading="lazy"` (c'est elle qui fait le LCP).
- Script en `defer` ; seule une ligne en ligne dans le `head` pose la classe `js` avant la première peinture, pour éviter le flash du menu.

### Amélioration progressive

Sans JavaScript, la page reste complète : le menu est déplié, le bouton Menu n'apparaît pas, le formulaire est validé par le navigateur (`required`, `type="email"`). Le JS ne fait qu'enrichir. La validation côté client est un confort, jamais une sécurité : le serveur devra revalider.

## Vérifications

- [x] HTML : 0 erreur, 0 avertissement sur le [validateur W3C](https://validator.w3.org/nu/?doc=https%3A%2F%2Frayan-madi.github.io%2FCDWS-2027-FilRouge%2Fsrc%2F) (vnu 26.9.16) — capture : `docs/validateur-w3c.png`
- [x] Trois paliers sans débordement horizontal
- [ ] Rapport Lighthouse exporté en HTML dans `docs/`
- [ ] Rapport Wave ou Lighthouse accessibilité exporté dans `docs/`

## Crédits

- Police [Sora](https://github.com/sora-xor/sora-font) — SIL Open Font License 1.1 (`src/polices/OFL.txt`).
- Contenus (ateliers, formateurs) fictifs, projet pédagogique IMIE Paris.
