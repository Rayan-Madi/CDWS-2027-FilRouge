# FM04 — SkillHub en React : conception

Date : 30/10/2026 · Module BC01-FM04 (C06) · Projet fil rouge SkillHub
Sources : le support du module (81 diapositives) — TP 1 (diapo 29), TP 2 (diapo 53), chapitres 2 et 3, fiche EC02 (diapos 5, 14, 78, 79) — et la demande de Rayan du 30/10.

## 1. But

La séance fil rouge du 30/10 passe SkillHub en React. On livre le **TP 1** (la carte et la liste en composants, Tailwind avec les jetons de FM02) et, en avance sur le TP 2 du 24/11, ce que la demande nomme : **les routes React Router, l'inscription au site, l'inscription aux ateliers, toutes les parties de la landing transposées, les données en JSON**. Le code sera relu : chaque ligne doit pouvoir se défendre.

## 2. Décisions

| Question | Décision | Pourquoi |
|---|---|---|
| Étendue | Tout SkillHub : accueil, ateliers, fiche d'un atelier, formateurs, inscription, « Mon espace », page introuvable | demande de Rayan |
| Emplacement | `react/` dans ce dépôt : un projet Vite autonome (son `package.json`, ses tests) | une seule PR, comme FM03 ; `src/` (EC01) ne bouge pas |
| Approche | **transposer** FM03 à la manière du cours | TP 1 : « On ne refait pas SkillHub : on transpose » |
| En ligne | une GitHub Action publie le site actuel tel quel et l'application sous `/react/` | un lien à donner ; le rechargement d'une adresse profonde se vérifie en ligne |
| État | en mémoire (contextes) : un rechargement repart de zéro | pas de back-end avant BC02 ; « le stockage local ne sert que pour un confort » (diapo 50) |
| Compte | créer son compte connecte pour la visite ; ni connexion ni mot de passe | la demande dit « inscription site » ; une authentification simulée serait une fausse sécurité |
| Linter | Oxlint, celui du gabarit Vite | typescript-eslint refuse TypeScript 7 (vérifié : il plante au chargement) |

## 3. Outillage

Versions relevées sur npm le 30/10/2026, vérifiées ensemble par une sonde jetable (voir § 15) :

| Outil | Version | Rôle |
|---|---|---|
| Vite | 8.3.5, gabarit `create-vite@9.3.3 --template react-ts` | serveur de développement et construction ; ne vérifie aucun type, d'où `tsc -b && vite build` |
| React, React DOM | 19.3.1 | le rendu |
| TypeScript | 7.0.2, comme FM03 | `tsc -b` ; mêmes options strictes que le `tsconfig.json` de FM03 (le gabarit en a quatre, on ajoute `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`) |
| Oxlint | celui du gabarit | règles des hooks comprises ; ne dépend pas de TypeScript |
| React Router | 8.5.1, paquet `react-router` | mode déclaratif ; tout s'importe de `react-router`. **Pas de `react-router-dom`** : il n'existe plus en v8, et sa v7 installée à côté casse le rendu (deux contextes) |
| Tailwind CSS | 4.3.3 (`@tailwindcss/vite`) | utilitaires ; jetons dans `tailwind.config.js`, branché par `@config` |
| Vitest | 5.0.5, jsdom 30.1.3, Testing Library (`react` 16.3.3, `dom` 10.4.2, `user-event` 14.6.8, `jest-dom` 7.0.1) | tests unitaires, de composants et de bout en bout |
| puppeteer-core, axe-core | ceux de FM03 | tests de bout en bout sur le site construit et assemblé |

Versions exactes dans `package.json`, `package-lock.json` commité, `npm ci` en intégration continue (c'est lui qui révèle les conflits de dépendances).

## 4. Arborescence

Les noms de dossiers sont ceux de la fiche correcteur (diapo 14) : en anglais, sans traduction.

```
react/
├── index.html              la seule page HTML (SPA) : lang="fr", #racine, police préchargée,
│                           script qui restaure une adresse profonde après le 404.html (§ 11)
├── package.json            scripts : dev, build, lint, test, test:e2e, captures
├── vite.config.ts          React, Tailwind, base de publication, copies des routes fixes (§ 11), Vitest
├── tailwind.config.js      les jetons de FM02 : mêmes hexadécimaux, ratios en commentaire
├── .oxlintrc.json          le linter du gabarit
├── tsconfig*.json          strict, mêmes options que FM03 ; un projet pour src, un pour tests
├── public/                 servi tel quel : favicon, images WebP de FM03
├── src/
│   ├── main.tsx            point d'entrée : monte <Application /> dans #racine
│   ├── Application.tsx     les fournisseurs (annonces, compte, inscriptions) autour du routeur
│   ├── index.css           Tailwind, @config, polices Sora, base (focus visible, modale, mouvement réduit)
│   ├── types.ts            repris de FM03, identique à l'octet près
│   ├── polices/            Sora 400 et 600 (woff2) et leur licence OFL, copiés de FM03
│   ├── router/             routes.tsx (le seul endroit où les routes sont déclarées),
│   │                       chemins.ts (les adresses, partagées avec vite.config.ts), ExigeConnexion.tsx
│   ├── views/              une vue par route : Accueil, Catalogue, FicheAtelier, Formateurs,
│   │                       Inscription, Dashboard (« Mon espace »), PageIntrouvable
│   ├── components/         des briques qui ne connaissent pas les routes (§ 6)
│   ├── contexts/           Annonces, Compte, Inscriptions : un fournisseur + un hook maison chacun
│   ├── hooks/              useAteliers, useCriteres, useActionsInscription
│   ├── services/           api.ts et serveur-simule.ts (FM03), formateurs.ts (import JSON)
│   ├── utils/              filtre.ts et format.ts (FM03), validation.ts, messages.ts
│   └── donnees/            ateliers.json (copie de FM03), formateurs.json
└── tests/
    ├── setup.ts            jest-dom, nettoyage entre deux tests, <dialog> et scrollTo pour jsdom
    ├── outils/             pilote du navigateur (repris de FM03), émulateur de GitHub Pages
    ├── unitaires/          logique pure, reprise de FM03, jetons
    ├── composants/         composants, vues, contextes, hooks (jsdom + Testing Library)
    └── e2e/                le site construit et assemblé, servi comme par GitHub Pages (puppeteer-core)
```

Les tests restent hors de `src/` : `src/` ne montre que l'application, c'est le premier dossier que le correcteur ouvre (diapo 15). Un `tsconfig.tests.json` les fait vérifier par `tsc -b`.

`Dashboard` est le seul nom anglais d'une vue : c'est celui de la fiche EC02 (« AUX NOMS DE LA FICHE », TP 2). `src/utils/` n'est pas dans la liste du cours : il range la logique pure partagée (filtrer, formater, valider), qui n'est ni un dialogue avec l'extérieur (`services/`) ni un hook.

## 5. Routes

Déclarées dans `src/router/routes.tsx` : `RoutesSkillHub` (l'arbre `<Routes>`, testable sous un `MemoryRouter`) et `Routeur` (`BrowserRouter` + `RoutesSkillHub`, `basename` = `import.meta.env.BASE_URL`). Un layout parent (`Layout`) enveloppe toutes les vues.

| Chemin | Vue | Titre de l'onglet | Remarques |
|---|---|---|---|
| `/` (index) | Accueil | SkillHub – apprendre avec un formateur indépendant | le titre de FM03 |
| `/ateliers` | Catalogue | Les ateliers · SkillHub | critères dans l'URL : `recherche`, `niveau`, `soir=oui`, `tri` |
| `/ateliers/:id` | FicheAtelier | « titre de l'atelier » · SkillHub | identifiant inconnu : « Atelier introuvable » |
| `/formateurs` | Formateurs | Nos formateurs · SkillHub | données importées de `formateurs.json` |
| `/inscription` | Inscription | Créer mon compte · SkillHub | `?profil=formateur` présélectionne ; `state.depuis` pour revenir |
| `/mon-espace` | Dashboard, sous le garde `ExigeConnexion` | Mon espace · SkillHub | sans compte : `<Navigate to="/inscription" replace state={{ depuis }} />` |
| `*` | PageIntrouvable | Page introuvable · SkillHub | jamais d'écran blanc |

## 6. Composants

| Composant | Rôle | Reçoit |
|---|---|---|
| `Layout` | lien d'évitement, `EnTete`, `<main id="contenu">` et son `Outlet`, `PiedDePage` ; défilement et focus à chaque changement de page (§ 8.1) | — |
| `EnTete`, `PiedDePage` | logo, navigation ; liens du pied | — |
| `Navigation` | menu mobile (bouton `aria-expanded` + `aria-controls`), `NavLink` (`aria-current="page"`), sous-menu « Ateliers » (trois raccourcis), « S'inscrire » ou « Mon espace » selon le compte | état local `{ menuOuvert, sousMenuOuvert }` |
| `TitreDeVue` | le `<h1 tabIndex={-1}>` de chaque vue et le titre de l'onglet | `children: string`, `titreOnglet?: string` |
| `CarteAtelier` | un atelier : titre (lien vers sa fiche), catégorie, description, infos, `<time>`, formateur, prérequis, places, prix, action. Aucun état, ne décide de rien | `atelier`, `placesRestantes`, `inscrit`, `envoi?`, `erreur?`, `niveauTitre?` (2 ou 3), `onInscrire(id)`, `onDesinscrire(id)` |
| `ActionInscription` | le bouton « S'inscrire » / « Se désinscrire », l'état d'envoi, l'erreur ; partagé par la carte et la fiche | `titre`, `inscrit`, `complet`, `envoi?`, `erreur?`, `onInscrire()`, `onDesinscrire()` |
| `ListeAteliers` | la grille de cartes, `key={atelier.id}` ; branche chaque carte sur les inscriptions et rend la confirmation de désinscription | `ateliers`, `niveauTitre?` |
| `FiltresAteliers` | `<form role="search">` : recherche, niveau, tri, « le soir » | `criteres`, `onChange(partiel)` |
| `CartesFantomes` | trois cartes de chargement, `aria-hidden` | — |
| `Champ` | étiquette, aide, erreur et attributs reliés (`useId`, `aria-describedby`, `aria-invalid`) ; variante case à cocher | `libelle`, `aide?`, `erreur?`, rendu du champ |
| `Modale` | un `<dialog>` ouvert par `showModal()` : Échap et le fond ferment, le focus revient au déclencheur (ou au `h1` s'il a disparu) | `ouverte`, `titre`, `onFermer`, `children` |
| `ConfirmationDesinscription` | « Se désinscrire de … ? » dans la `Modale`, envoi et erreur compris | `atelier`, `onConfirmer()`, `onAnnuler()` |
| `CarteFormateur` | photo (`srcset`), nom, rôle, citation | `formateur` |
| `Action` | `BoutonAction` et `LienAction` : les mêmes classes, primaire ou secondaire, 44 px de haut au moins | `variante?` + attributs natifs |
| `icones.tsx` | les SVG de FM03 (logo, menu, chevron, valeurs), `aria-hidden` | — |

## 7. Données et état

Chaque donnée vit au plus bas niveau qui suffit (diapo 50) ; ce qui se calcule n'est pas un état (diapo 44).

| Donnée | Où elle vit | Pourquoi |
|---|---|---|
| Les ateliers | `useAteliers()` dans chaque vue qui les montre : `fetch` du `ateliers.json` par `chargerAteliers` (FM03) | donnée du serveur : chargée, pas copiée dans un état partagé |
| Les formateurs | `import` statique de `formateurs.json` (`services/formateurs.ts`) | contenu figé, inscrit dans le paquet au build : rien à charger |
| Les critères du catalogue | l'URL (`useSearchParams`, via `useCriteres`) | partageable, survit au rechargement (TP 2, point 2) |
| Le texte tapé dans la recherche | état local de `FiltresAteliers`, versé dans l'URL après 300 ms de calme | une écriture d'historique par lettre serait limitée par Safari et annoncerait chaque lettre |
| La liste filtrée, le compteur, les places restantes | valeurs dérivées (`filtrerAteliers`, `decrireResultat`, `places − 1` si inscrit) | calculables : surtout pas un `useState` |
| Menu ouvert, modale ouverte, saisie d'un formulaire, envoi en cours | `useState` local | éphémère, un seul composant |
| La personne inscrite | contexte `Compte` | lue par la navigation, l'accueil, le garde, les inscriptions |
| Les inscriptions aux ateliers | contexte `Inscriptions` | lues par quatre vues |
| Les annonces | contexte `Annonces` : une seule région `role="status"` | une région présente dès le départ, remplie au besoin |

### Contrats

```ts
// contexts/Compte.tsx
useCompte(): { utilisateur: Inscription | null; creerCompte(inscription: Inscription): Promise<void> }
// contexts/Inscriptions.tsx
type Envoi = "inscription" | "desinscription";
useInscriptions(): {
  inscrits: ReadonlySet<string>;
  envois: ReadonlyMap<string, Envoi>;
  erreurs: ReadonlyMap<string, string>;
  inscrire(atelier: Atelier): Promise<void>;
  desinscrire(atelier: Atelier): Promise<void>;
  placesRestantes(atelier: Atelier): number;
}
// contexts/Annonces.tsx
useAnnonce(): (texte: string) => void
// hooks/useAteliers.ts
type Requete<T> = { statut: "chargement" } | { statut: "erreur"; erreur: ErreurChargement } | { statut: "succes"; donnees: T };
useAteliers(): { requete: Requete<readonly Atelier[]>; recharger(): void }
// hooks/useCriteres.ts
useCriteres(): [Criteres, (partiel: Partial<Criteres>) => void]
// hooks/useActionsInscription.ts
useActionsInscription(): {
  inscrire(atelier: Atelier): void;              // sans compte : vers /inscription, puis retour
  demanderDesinscription(atelier: Atelier): void; // ouvre la confirmation
  aConfirmer: Atelier | null;
  confirmer(): Promise<void>;
  annuler(): void;
}
```

Les fonctions des contextes sont stables (`useCallback` + forme fonctionnelle des mises à jour) et la valeur fournie passe par `useMemo` (diapo 46). Chaque hook maison lève une erreur explicite hors de son fournisseur (diapo 47).

## 8. Comportements

### 8.1 Navigation et accessibilité

Ce qu'une navigation sans rechargement perd (diapo 36), et comment on le rend :

- **Titre de l'onglet** : `TitreDeVue` l'écrit à chaque vue, y compris la fiche (titre de l'atelier).
- **Focus** : à chaque changement de **chemin**, `Layout` porte le focus sur le `h1` de la nouvelle vue (`tabIndex={-1}`, `preventScroll`). Pas au premier chargement : le focus reste en tête de document, comme pour une page classique. Un changement de critères (même chemin) ne bouge rien. Un lien du menu qui mène au chemin courant (un raccourci depuis `/ateliers`) porte aussi le focus sur le `h1` : sinon il tomberait dans un menu refermé.
- **Défilement** : en haut à chaque changement de chemin. Au retour arrière (`POP`), on n'y touche pas : le navigateur restaure la position (`history.scrollRestoration` reste à `auto`), et un test de bout en bout le vérifie. `ScrollRestoration` de React Router n'existe qu'avec un routeur de données. L'effet ne dépend que du chemin ; le type de navigation et le premier rendu sont lus par `useEffectEvent` (React 19.3) : un effet qui dépendrait aussi du type remonterait la page à chaque filtre.
- **Annonce** : le focus sur le `h1` fait lire le nouveau titre ; les résultats d'action passent par la région du contexte `Annonces`.
- **Page introuvable** : la route `*`.
- **Menu** : sous 48rem, le bouton « Menu » (`aria-expanded`, `aria-controls`) ouvre la liste ; au-dessus, elle est toujours visible. Le bouton à côté de « Ateliers » ouvre trois raccourcis (« Tout le catalogue », « Pour débutants », « Le soir ») : ce sont des liens vers `/ateliers?…`, de simples `Link` (un `NavLink` les marquerait tous actifs). Échap referme le sous-menu (focus sur son bouton), sinon le menu (focus sur « Menu ») ; un clic dehors, un focus qui sort de la `nav` ou un lien suivi referment tout.
- **Lien d'évitement** « Aller au contenu » en premier : il porte le focus sur `<main>` sans ajouter `#contenu` à l'adresse.

### 8.2 Catalogue (TP 1, puis TP 2 point 2)

- Critères dans l'URL : `?recherche=git&niveau=debutant&soir=oui&tri=prix-croissant`. Valeurs par défaut absentes de l'adresse ; une valeur inconnue (`niveau=expert`) vaut la valeur par défaut. Les changements de critères **remplacent** l'entrée d'historique : le retour arrière quitte le catalogue au lieu de défaire un filtre.
- Recherche : le texte s'affiche tout de suite ; il part dans l'URL après 300 ms de calme, ou tout de suite avec Entrée. Changer de niveau, de tri ou du soir emporte la frappe en attente. Une adresse changée d'ailleurs (raccourci, « Tout afficher », retour arrière) remet le champ à jour ; la frappe en cours n'est jamais écrasée.
- Recherche sans accents ni casse sur le titre, le formateur et la catégorie ; tri par date, prix croissant, prix décroissant ; « le soir » = 18 h ou plus tard, heure de Paris (`filtre.ts` et `format.ts` de FM03).

| État | À l'écran | Annonce | Focus |
|---|---|---|---|
| Chargement | trois cartes fantômes, `aria-busy="true"` sur la liste | « Chargement des ateliers… » (`role="status"`) | inchangé |
| Erreur | la phrase de FM03 selon la raison (jamais le code HTTP, qui part en console) et « Réessayer » | `role="alert"` | après « Réessayer » : le `h1` |
| Vide | « Aucun atelier ne correspond à ces filtres. » et « Tout afficher » | la même phrase (`role="status"`) | après « Tout afficher » : le champ de recherche |
| Succès | les cartes (titres en `h2`) | « 4 ateliers · niveau débutant · le soir · par prix croissant » | inchangé |

Le rendu est un `switch` exhaustif sur l'état : une branche oubliée ne compile pas (diapo 57).

### 8.3 Inscription au site

Formulaire contrôlé (`value` + `onChange`, diapo 51), `noValidate`, mêmes champs et mêmes messages que FM03 :

| Champ | Règle | Message |
|---|---|---|
| Prénom et nom (`autocomplete="name"`) | au moins 2 caractères hors espaces | « Indiquez votre prénom et votre nom. » |
| Adresse électronique (`type="email"`, aide « Nous ne la transmettons à personne. ») | vide | « Indiquez votre adresse électronique. » |
| | `^[^@\s]+@[^@\s]+\.[^@\s.]{2,}$` (le domaine doit avoir un point) | « L'adresse doit ressembler à nom@exemple.fr. » |
| Je suis (`apprenant` « En reconversion », `formateur` « Formateur indépendant ») | choisi | « Choisissez votre profil. » |
| Conditions d'utilisation (et le `<details>` qui les détaille) | cochée | « Vous devez accepter les conditions pour continuer. » |

- L'erreur apparaît quand on quitte le champ, se met à jour à chaque frappe tant qu'elle est affichée, et toutes sont vérifiées à l'envoi, focus sur le premier champ fautif. Message relié par `aria-describedby`, `aria-invalid` sur le champ.
- Envoi : `preventDefault`, bouton en `aria-disabled` et « Inscription en cours… » (plutôt que `disabled`, qui ferait perdre le focus ; le clic est ignoré pendant l'envoi : pas de double envoi). Le serveur simulé de FM03 répond après 800 ms ; « adresse déjà inscrite » s'affiche en `role="alert"`.
- Réussite : le compte est créé et connecté ; retour à `state.depuis` s'il existe, sinon `/mon-espace` (entrée d'historique remplacée).
- Déjà connecté : la vue le dit et propose « Mon espace » et « Voir les ateliers ».

### 8.4 Inscription à un atelier

- **Places restantes** = `places` du JSON, moins une si l'on est inscrit (valeur dérivée).
- **Sans compte**, « S'inscrire » mène à `/inscription` (`state.depuis` = l'adresse courante, et une phrase qui dit pourquoi) ; le compte créé, on revient où l'on était.
- **Avec un compte**, « S'inscrire » (nom accessible : « S'inscrire à l'atelier Initiation à Git », `aria-label` qui commence par le texte visible) appelle `reserver()` du serveur simulé. Pendant l'envoi, le même bouton dit « Inscription en cours… » (`aria-disabled`). Réussite : le bouton devient « Se désinscrire », « Vous êtes inscrit » s'affiche, et la région d'annonce dit « Inscription confirmée : Initiation à Git, mercredi 4 novembre, 18 h 30. ». C'est le **même** élément : le focus ne bouge pas. Refus (« déjà réservé », « complet ») : message en `role="alert"` sous le bouton.
- **Complet** et pas inscrit : « Complet » dans la ligne des places, pas de bouton.
- **Se désinscrire** ouvre une `Modale` de confirmation (« Garder ma place » ou « Confirmer la désinscription ») ; la confirmation appelle `annulerReservation()` (ajoutée au serveur simulé), « Désinscription en cours… » pendant l'envoi, puis la modale se ferme et l'annonce dit « Désinscription confirmée : … ». Le focus revient au bouton déclencheur, ou au `h1` si la carte a disparu (« Mon espace »).

### 8.5 Mon espace (`Dashboard`)

« Bonjour Sarah » (`prenomDe` de FM03), le profil, puis « Mes ateliers » (`h2`) : les ateliers suivis, par date, avec leurs places restantes et « Se désinscrire » (TP 2, point 4). Aucun : « Vous n'êtes inscrit à aucun atelier pour l'instant. » et un lien vers le catalogue. Juste après la création du compte : « Votre compte est créé. Bienvenue ! ». Chargement et panne comme au catalogue.

### 8.6 Les autres vues

- **Accueil** : l'accroche de FM03 (`h1` « Reprenez la main sur votre reconversion », image en `srcset` 400/700/800, `width`/`height`, `fetchPriority="high"`), « Créer mon compte » (ou « Mon espace ») et « Voir les ateliers » ; « Nos valeurs » (trois cartes) ; « Les prochains ateliers » (les trois plus proches, avec `ListeAteliers`) et un lien vers tout le catalogue ; l'appel aux formateurs (vers `/inscription?profil=formateur`).
- **FicheAtelier** : `useParams`, puis l'atelier dans le catalogue chargé : description, une liste de définitions (formateur, date, durée, lieu, niveau, prérequis, places, prix), `ActionInscription`, retour au catalogue. Chargement et panne comme au catalogue ; identifiant inconnu : « Atelier introuvable » et un lien vers le catalogue.
- **Formateurs** : les trois formateurs de FM03, importés de `formateurs.json`, et l'appel aux formateurs.
- **PageIntrouvable** : « Page introuvable », l'adresse demandée, des liens vers l'accueil et les ateliers.

## 9. Style : Tailwind et les jetons de FM02

- `tailwind.config.js` porte les jetons du `:root` de `src/css/skillhub.css`, branché par `@config "../tailwind.config.js"` juste après `@import "tailwindcss"` (sans cette ligne, le fichier est ignoré **sans message**) :
  - `theme.extend.colors` : les 12 couleurs, mêmes noms, mêmes hexadécimaux, ratio de contraste mesuré en commentaire (`bg-accent`, `text-texte-doux`…) ;
  - `theme.fontSize` **hors de `extend`** : l'échelle de rapport 1,25 sous les noms des jetons (`xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl` pour `--t-*`). Elle remplace celle de Tailwind : dans `extend`, `text-xl` garderait l'interligne par défaut et `text-4xl` serait plus petit que notre `text-2xl` ;
  - `theme.borderRadius` **hors de `extend`** : `s` et `m`. Dans `extend`, `rounded-s` se mélangerait à l'utilitaire logique « côté début » (4 px d'un côté, 8 de l'autre) ; `rounded-full` (la pilule) et `rounded-none` restent ;
  - `lineHeight` : `texte` (1,5) et `titre` (1,2) ; `boxShadow` : `1` et `2` ; `fontFamily.sans` : la pile Sora (le reset l'applique à toute la page) ; `maxWidth.page` : 72rem ;
  - ni `spacing` (le pas de Tailwind, 0,25rem, EST le pas de 4 px de FM02 : `p-4` = 1rem, diapo 26), ni `content` (la 4.x trouve seule les classes ; la clé ajoute des sources sans en retirer, elle tromperait le lecteur).
- `@config` n'émet pas de variables CSS : dans `index.css`, une valeur de jeton s'écrit `--theme(--color-accent)`. `@source not "../public";` évite que les SVG de `public/` fabriquent des classes.
- Un test vérifie que les couleurs, les tailles, les rayons et les ombres de `tailwind.config.js` sont exactement ceux du `:root` de FM03 : la charte ne change pas parce que le framework change.
- Ce que le reset de Tailwind (preflight) retire et qu'on remet, dans `@layer base` ou par classes : le focus visible (contour de 3 px `accent`, décalé de 3 px, comme FM02) ; le centrage du `<dialog>` modal (`dialog:modal { margin: auto }`) ; le soulignement des liens dans le texte ; la bordure des champs (`border-texte-doux`, 7,52:1, jamais `bordure`, 1,48:1) ; la taille des titres (par classes) ; `role="list"` sur les listes stylées (sans puces, Safari leur retire leur sens de liste). Et `prefers-reduced-motion` respecté.
- Mobile d'abord : classes nues pour le téléphone, `sm:` (40rem), `md:` (48rem, le palier de FM03), `lg:` (64rem), en `min-width`. Grille des cartes : 1, puis 2 (`sm`), 3 (`lg`), 4 colonnes (`xl`) ; cartes en Flexbox colonne, action collée en pied ; cibles d'au moins 44 px (`min-h-11`). Vérifié à 360, 768 et 1280 px : aucune barre de défilement horizontale.
- Navigateurs : Tailwind 4 exige Chrome et Edge 111, Safari et iOS 16.4, Firefox 128 (`@property`, `color-mix`, `oklab`). FM02 n'imposait pas ce minimum : à écrire dans le README.

## 10. Ce que devient chaque module de FM03

| Module FM03 | Dans `react/` |
|---|---|
| `types.ts` | `src/types.ts`, identique à l'octet près |
| `api.ts`, `filtre.ts`, `format.ts` | `services/api.ts`, `utils/filtre.ts`, `utils/format.ts` : identiques, sauf les chemins d'import (un test le vérifie) |
| `serveur-simule.ts` | `services/serveur-simule.ts`, plus `annulerReservation()` (le désistement n'existait pas) |
| `catalogue.ts` | la vue `Catalogue` + `useAteliers` + `useCriteres` ; `messageErreur()` passe dans `utils/messages.ts` |
| `carte.ts` | `CarteAtelier` + `ActionInscription` |
| `menu.ts` | `Navigation` |
| `navigation-courante.ts` | disparaît : les sections sont devenues des pages, `NavLink` pose `aria-current="page"` |
| `validation.ts` | `utils/validation.ts` (règles pures, mêmes messages) + `Champ` |
| `envoi.ts`, `inscription.ts` | la vue `Inscription` (formulaire contrôlé) et le contexte `Compte` |
| `modale.ts` | la fiche devient une route (`FicheAtelier`) ; le `<dialog>` sert à la confirmation de désinscription (`Modale`) |
| `formulaire.ts` | `prenomDe()` passe dans `utils/messages.ts` ; `texteDu()` n'a plus d'usage (pas de `FormData` dans un formulaire contrôlé) |
| `attendre-la-fin.ts` | l'anti-rebond de la recherche, réécrit en effet avec minuterie et nettoyage |
| `dom.ts`, `main.ts` | sans objet : React rend, `main.tsx` monte |

## 11. Publication

- **Aujourd'hui** : source « branche » (`main`, racine), construite par Jekyll 3.10. Le site en ligne n'est donc pas le dépôt tel quel : Jekyll y ajoute 22 fichiers (`/docs/` tiré de `docs/README.md`, les `.md` rendus en `.html`, `/outils/figma-skillhub/`, `assets/css/style.css`).
- **Demain** : `.github/workflows/publier.yml` (sur `main` et à la demande), deux jobs. `construire` : `actions/checkout@v7`, puis `actions/jekyll-build-pages@v1` sur la racine (la même action que la construction actuelle : les 22 pages restent) **avant** tout `npm ci` (Jekyll n'exclut pas un `node_modules` rangé dans un sous-dossier), puis `actions/setup-node@v7` (Node 24, cache npm sur `react/package-lock.json`), `npm ci && npm run build` dans `react/`, puis `sudo rm -rf _site/react && sudo cp -r react/dist _site/react` (Jekyll tourne en root dans Docker), puis `actions/upload-pages-artifact@v5`. `deployer` : `actions/deploy-pages@v5`, `pages: write` et `id-token: write` sur ce seul job, environnement `github-pages`, `concurrency: pages` sans annulation.
- **La bascule** de la source vers « GitHub Actions » (`gh api --method PUT repos/Rayan-Madi/CDWS-2027-FilRouge/pages -f build_type=workflow`, accord de Rayan du 30/10) se fait **juste avant** la fusion : sinon chaque push déploie deux fois (Jekyll seul et le workflow) et le dernier fini gagne. Le dernier déploiement reste en ligne pendant la bascule. Retour arrière : `-f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/'`. Puis vérification en ligne de `/`, `/src/`, `/docs/fm03-tp3-catalogue.html`, `/react/` et d'un rechargement profond.
- Vite construit avec `base: "/CDWS-2027-FilRouge/react/"` (absolue : `./` casse les adresses à deux segments) ; le routeur prend `basename={import.meta.env.BASE_URL}`. Vite ne réécrit pas les chaînes du JSX : tout fichier de `public/` (images) est préfixé par `import.meta.env.BASE_URL`. Sous Git Bash, une valeur qui commence par `/` passée en ligne de commande est convertie en chemin Windows : la base vit dans `vite.config.ts`, jamais en option.
- **Liens profonds.** GitHub Pages ne sert qu'un `404.html`, celui de la racine, avec le statut 404 ; il sert `x.html` pour `/x`, et redirige un dossier sans barre finale (301). Deux mesures :
  1. les routes **fixes** (`/ateliers`, `/formateurs`, `/inscription`, `/mon-espace`) reçoivent au build une copie de `index.html` (`ateliers.html`…) : le rechargement direct répond **200**, sans détour. La liste vient de `src/router/chemins.ts`, que lisent aussi les routes : elle ne peut pas diverger ;
  2. le reste (`/ateliers/:id`, une adresse inconnue) passe par un `404.html` **à la racine du dépôt** (technique spa-github-pages de rafgraph, licence MIT) : sous `/CDWS-2027-FilRouge/react/`, il renvoie vers `/react/?/<chemin>&<requête>#<ancre>`, et un script en tête de `react/index.html` remet l'adresse d'origine (`history.replaceState`) avant que React démarre. Une garde (`?/` déjà présent) empêche la boucle infinie si l'application manque. Toute autre adresse inconnue du site garde une vraie page introuvable, lisible sans JavaScript, avec des liens vers les deux versions.
- `vite preview` renvoie `index.html` pour toute adresse sous la base : il cache ce problème. Les tests de bout en bout servent donc le site **assemblé** (`git archive` + `react/dist` dans `react/`) avec un émulateur de GitHub Pages (`tests/outils/pages-local.ts` : 404.html avec statut 404, `x.html` pour `/x`, 301 sur un dossier, requête ignorée) : ce qui est testé est ce qui est publié, Jekyll mis à part.
- `verifier.yml` passe aussi à `actions/checkout@v7` et `actions/setup-node@v7` (les v4 ciblent Node 20, déprécié) et gagne un job `react`.

## 12. Tests et preuves

Écrits avant le code (TDD), lancés par `npm test` dans `react/` et par l'intégration continue.

**Réglages vérifiés par la sonde.** Vitest lit le champ `test` de `vite.config.ts` (`/// <reference types="vitest/config" />`), en trois projets : `unitaires` (Node), `composants` (jsdom) et `e2e` (Node, sur le site construit). `globals` reste à `false` (on importe `describe`, `test`, `expect`, `vi`) ; `unstubGlobals: true` (un faux `fetch` ne fuit pas d'un test à l'autre). `tests/setup.ts` : `import "@testing-library/jest-dom/vitest"`, `afterEach(cleanup)` (sans `afterEach` global, Testing Library ne nettoie rien), un `<dialog>` minimal pour jsdom 30, qui n'a ni `showModal()` ni `close()` ni événement `close` (le vrai comportement, Échap et focus piégé compris, se vérifie dans le navigateur), et `window.scrollTo` remplacé (absent de jsdom). Minuteries simulées : `vi.useFakeTimers({ shouldAdvanceTime: true })` avec `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`, jamais `useFakeTimers()` seul (Testing Library se bloquerait). `fetch` simulé : une `Response` neuve à chaque appel (StrictMode double les effets en développement : une même `Response` se lirait deux fois). axe-core sous jsdom sans la règle `color-contrast` (jsdom n'a pas de canvas) : le contraste se vérifie dans le navigateur.

- **Unitaires** : règles de validation (chaque message), lecture et écriture des critères de l'URL, `annulerReservation`, `formateurs.json` (identifiants uniques, photos présentes), reprise de FM03 (`types.ts` identique ; `api.ts`, `filtre.ts`, `format.ts` identiques aux chemins d'import près ; `ateliers.json` identique), jetons (`tailwind.config.js` = `:root` de FM03).
- **Composants** (jsdom, Testing Library) : `CarteAtelier` (aucun état, `onInscrire` appelé avec l'identifiant, noms accessibles, complet, inscrit) ; `Catalogue` (quatre états avec `fetch` simulé, critères écrits dans l'URL, compteur, « Tout afficher », « Réessayer » et focus) ; `Navigation` (`aria-expanded`, Échap, `aria-current`, raccourcis) ; `Layout` et `TitreDeVue` (titre de l'onglet, focus après navigation mais pas au premier rendu, rien sur un changement de critères) ; `Inscription` (messages, `aria-invalid`, focus sur le premier champ fautif, envoi, « déjà inscrit », retour à `depuis`) ; garde (redirection avec `replace`) ; `Dashboard` (liste, désinscription par la modale, vide) ; `FicheAtelier` (trouvé, inconnu, chargement) ; hooks hors de leur fournisseur.
- **De bout en bout** (Chrome sans fenêtre, sur le site assemblé) : rechargement direct de `/react/mon-espace`, `/react/ateliers/git-initiation`, d'une adresse inconnue ; parcours complet au clavier (évitement, menu, filtre, fiche, compte, inscription, Mon espace, désinscription par la modale) ; pannes du catalogue (404, hors ligne) ; 360, 768 et 1280 px sans débordement ; axe-core sans violation sur chaque vue ; aucune erreur en console ; le site FM03 toujours servi.
- **Intégration continue** : un job `react` dans `verifier.yml` (installation, `tsc`, tests, build, bout en bout).
- **Preuves pour le TP** : sortie de `npm run build` (tailles), captures des vues à 360, 768 et 1280 px, parcours clavier relevé.

## 13. Documents

- `react/README.md` : les trois sections que la fiche EC02 exige (« Choix du framework », « Justification de l'architecture », « Organisation des composants ») avec le comparatif du chapitre 1 adapté, puis lancer, tester, construire, routes, état, accessibilité, publication.
- `docs/fm04-react.md` : le rapport — le TP 1 étape par étape, la partie du TP 2 faite en avance, ce que chaque module de FM03 est devenu, le parcours au clavier, les tailles du build, les captures, et ce que Rayan doit refaire lui-même.
- `docs/captures/fm04/`, mises à jour de `README.md`, `docs/README.md`, et une fiche de révision pour l'oral de l'EC02 (`docs/revision-oral-ec02.md`).
- Commits en français, réalistes, une pointe d'humour mais clairs sur ce qui change.

## 14. Hors périmètre

- Le côté formateur : `CreerAtelier`, `MesAteliers` (TP 2, 24/11).
- Une vraie API (`json-server`, `VITE_API_URL`), le découpage `lazy`/`Suspense` et ses mesures, les rapports Lighthouse et Wave exportés (TP 3, 25/11).
- Next.js (TP 4).
- La persistance (`localStorage`), une connexion avec mot de passe (BC02).

## 15. Sonde de l'outillage

Avant d'écrire le plan, cinq sondes jetables (hors dépôt, 30/10/2026) ont vérifié que ces versions marchent ensemble ; leurs conclusions sont intégrées ci-dessus et rappelées ici.

| Sonde | Conclusion |
|---|---|
| Vite + TypeScript | `create-vite@9.3.3 --no-interactive --template react-ts` donne Vite 8.3.5, React 19.3.1, TypeScript 7.0.2 et Oxlint. `tsc -b` (TS 7) passe, options strictes de FM03 comprises. Les six modules de FM03 compilent sans retouche (imports en `.js` acceptés par la résolution `bundler`) ; placer `types.ts` à la racine change quatre lignes d'import. `new URL("../donnees/ateliers.json", import.meta.url)` émet le JSON avec empreinte (7,1 kB, au-dessus du seuil d'insertion de 4 kB) ; l'import statique d'un JSON est typé et inscrit dans le paquet. typescript-eslint refuse TypeScript 7 (d'où Oxlint). |
| Tailwind | `@config` marche en 4.3.3 ; `fontSize` et `borderRadius` hors de `extend` (collisions sinon) ; `content` inutile ; pas de variables CSS avec `@config` (`--theme()`) ; le reset casse le centrage du `<dialog>`, le focus visible, les champs et les titres ; navigateurs minimaux Chrome 111, Safari 16.4, Firefox 128. |
| React Router | 8.5.1 : tout s'importe de `react-router`, `react-router-dom` n'existe plus ; `NavLink` pose `aria-current="page"` ; `useSearchParams` avec `{ replace: true }` remplace bien l'entrée ; `ScrollRestoration` exige un routeur de données ; `basename={import.meta.env.BASE_URL}` marche, barre finale comprise ; sous Vitest, `BASE_URL` vaut `/`. 24 tests de routes verts sous `MemoryRouter`. |
| Tests | Vitest 5.0.5 + jsdom 30.1.3 + Testing Library : 29 tests verts ; réglages du § 12 ; `tsc -b` vérifie aussi les tests. |
| Publication | versions actuelles des actions (checkout v7, setup-node v7, upload-pages-artifact v5, deploy-pages v5, jekyll-build-pages v1) ; un seul `404.html`, à la racine ; la technique de rafgraph et sa garde anti-boucle, vérifiées sur un émulateur ; artefact assemblé d'environ 8,5 Mo. Non vérifiable avant la fusion : le workflow lui-même sur GitHub, et l'absence de coupure pendant la bascule (déduite de la documentation). |
