# SkillHub en Next.js

Le SkillHub du projet Vite ([`../react/`](../react/)), **transformé** en Next.js : on ne réécrit pas, on transforme. Les routes deviennent des dossiers, et le catalogue se rend sur le serveur. Module **BC01-FM04**, TP 4.

**Next.js 16.4 (App Router, Turbopack, Cache Components) · React 19 · TypeScript · Tailwind CSS 4**

Créé par `npx create-next-app@16.4` avec les réglages du TP : TypeScript, ESLint, React Compiler NON, Tailwind, dossier `src/` OUI, App Router, Cache Components OUI, alias `@/*`, `AGENTS.md` OUI, Agent feedback NON.

```bash
cd nextjs-skillhub
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                  # http://localhost:3000
npm run lint                 # ESLint
npm run build                # next build : types, prérendu, tableau des routes
npm start                    # le résultat construit, servi par Node.js
```

Avec `NEXT_PUBLIC_API_URL`, le catalogue vient de l'API du TP 3. Lancez-la avant `npm run build` avec `npm run api` dans `../react/`. Sans cette variable, comme dans la CI, il est lu dans `src/donnees/ateliers.json`.

## Rangement

```
src/
├── app/          une page.tsx par route ; layout.tsx (fournisseurs, en-tête, pied), not-found.tsx, ateliers/error.tsx
├── components/   les composants du projet Vite, et ses vues devenues composants clients (Catalogue, Dashboard, MesAteliers, CreerAtelier, FormulaireInscription)
├── contexts/     Compte, Inscriptions, AteliersCrees : "use client", posés par Fournisseurs dans layout.tsx
├── hooks/        useCriteres, useActionsInscription (passés à next/navigation), useFormulaire (inchangé)
├── services/     api.ts (FM03, inchangé), config.ts, en-cache.ts ("use cache"), serveur-simule.ts, formateurs.ts
├── utils/        la logique pure de FM03 et du TP 2, plus chemins.ts
├── donnees/      ateliers.json, formateurs.json
├── proxy.ts      le garde de /mon-espace, côté serveur
└── types.ts      repris tel quel
```

## Ce que la transformation a changé

| Dans le projet Vite | En Next.js | Pourquoi |
|---|---|---|
| `types.ts`, `utils/`, `useFormulaire` | Rien | Du TypeScript ordinaire |
| Imports en `.js` (`"../types.js"`) hérités de FM03 | Sans extension | Turbopack ne fait pas correspondre `.js` à `.ts` : `next build` s'arrêtait sur « Module not found » |
| `contexts/` | `"use client"` en tête, et `Fournisseurs` posé dans `layout.tsx` | Un contexte n'existe pas dans un composant serveur |
| `components/` | `"use client"` en tête de ceux qu'une page ou un layout affiche directement : `ListeAteliers`, `Navigation`, `Catalogue`… `CarteAtelier`, `Modale`, `FiltresAteliers` suivent sans la directive | La directive au plus près des composants interactifs : le reste ne part pas au navigateur |
| `router/routes.tsx`, `views/` | Un dossier et sa `page.tsx` par route ; les vues interactives deviennent des composants clients que la page enveloppe | Le routage par fichiers |
| `Layout.tsx` | `app/layout.tsx`, et `SuiviDeNavigation` pour le focus | Next.js défile et annonce la page lui-même, mais ne déplace pas le focus |
| Route `*` | `app/not-found.tsx`, rendu aussi par `notFound()` | |
| `ExigeConnexion` | `proxy.ts` (cookie `session`, 307 vers `/inscription?depuis=…`) et `GardeEspace` côté client | Le proxy filtre avant le rendu. Le compte vit en mémoire : après un rechargement, le cookie reste et le compte non, d'où le second garde |
| `react-router` : `Link to`, `NavLink`, `useNavigate`, `useSearchParams` | `next/link` (`href`) ; `usePathname` et `aria-current` posé à la main ; `useRouter` ; `useSearchParams` sous `<Suspense>` | Sans `<Suspense>`, `next build` refuse la page prérendue |
| Le `state` de navigation (`depuis`, `bienvenue`, `publie`) | Des paramètres d'adresse (`?depuis=…`) | Next.js n'a pas de `state`. `depuis` se fabrique à la main : on n'y revient que si c'est un chemin du site (`//ailleurs.fr` est refusé) |
| `import.meta.env.VITE_API_URL` (dans `services/config.ts`) | `process.env.NEXT_PUBLIC_API_URL` | Une adresse inscrite au build, jamais un secret |
| `useAteliers` et ses quatre états | Supprimé. Le serveur attend `catalogueEnCache()` (`"use cache"`, `cacheLife("hours")`) ; « chargement » disparaît (prérendu), « erreur » devient `error.tsx` et son `retry`, « vide » et « succès » restent dans la page et `Catalogue` | Une page serveur attend ses données avant de rendre |
| `FicheAtelier` qui cherchait dans le catalogue chargé | `ateliers/[id]/page.tsx` : `await params`, `generateStaticParams` (les 14 fiches au build), `generateMetadata`, `notFound()` | |
| `TitreDeVue` : focus, titre de l'onglet | Le `h1`, cible du focus, et rien d'autre : un composant serveur | `metadata` (gabarit `%s · SkillHub`) écrit le titre dans le HTML |
| Polices préchargées à la main dans `index.html` (TP 3) | `next/font/local` | Préchargement et police de repli aux mêmes mesures : pas de décalage (CLS 0) |
| `new Date().getFullYear()` dans le pied | Retiré | `new Date()` est interdit pendant le prérendu avec Cache Components |
| `tailwind.config.js` | `tailwind.config.mjs`, police `var(--font-sora)` | Node le lisait en ESM après un avertissement |

## Ce que le build a dit

Le refus prévu par la diapo 5.5 a été reproduit : avec `chargerAteliers()` appelé directement dans `app/ateliers/page.tsx`, `next build` s'arrête :

```
Error: Route "/ateliers": Next.js encountered uncached or runtime data during prerendering.
Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] For uncached data (`fetch`, database calls): cache the access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route
```

La correction [cache] est `services/en-cache.ts`. Le build passe alors (API du TP 3 lancée) :

```
Route (app)                       Revalidate  Expire
┌ ○ /                                     1h      1d
├ ○ /_not-found
├ ○ /ateliers                             1h      1d
├   /ateliers/[id]
│ ├ ◐ /ateliers/[id]
│ ├ ○ /ateliers/git-initiation            1h      1d
│ ├ ○ /ateliers/figma-maquette            1h      1d
│ └ ◐ [+12 more paths]
├ ○ /formateurs
├ ○ /inscription
├ ○ /mon-espace                           1h      1d
├ ○ /mon-espace/creer-un-atelier
└ ○ /mon-espace/mes-ateliers
ƒ Proxy (Middleware)
○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

Ce qui se lit dans ce tableau :
- les pages qui lisent le catalogue sont statiques et revalidées toutes les heures (`cacheLife("hours")`) ;
- les 14 fiches sont prérendues ;
- une fiche inconnue est rendue à la requête (`◐`) ;
- le proxy garde `/mon-espace`.

## Vérifié sur `next start`

- **HTML livré.** `/ateliers` contient déjà les 14 cartes, avant tout JavaScript : le repli du `Suspense` est la liste complète. Chaque fiche porte son `<title>` (« Initiation à Git · SkillHub »). L'accueil contient l'image d'accroche, que le navigateur découvre sans attendre le JavaScript : c'était le défaut relevé par Lighthouse au TP 3.
- **Le garde.** `/mon-espace` sans cookie : 307 vers `/inscription?depuis=%2Fmon-espace`. Avec le cookie, mais après un rechargement : `GardeEspace` renvoie vers l'inscription. Un apprenant sur une page formateur lit « Réservé aux formateurs ».
- **Les parcours du projet Vite, rejoués dans Chrome :**
  - le filtre et la recherche passent dans l'adresse (`?recherche=git&niveau=debutant`) et le résultat s'annonce ;
  - focus sur le `h1` après chaque navigation ;
  - inscription sans compte, puis retour à la fiche, puis « Se désinscrire » ;
  - Mon espace, puis publication d'un atelier ;
  - `?depuis=//exemple.com/piege` ramène sur Mon espace, pas ailleurs ;
  - aucune erreur ni avertissement en console.
- **Lighthouse 13.6, émulation mobile :**
  - accueil : Performance 96, Accessibilité 100, Bonnes pratiques 100, SEO 100 ;
  - catalogue : Performance 94, Accessibilité 100.

  C'est proche du projet Vite (98 sur l'accueil), pas mieux. Le gain du rendu serveur est ailleurs : le contenu est dans le HTML, pour les robots et pour un JavaScript lent. En contrepartie, l'hydratation des 14 cartes du catalogue occupe le navigateur 300 ms.

**Limites connues :**
- **Une fiche inconnue répond 200, pas 404.** Le contenu est « Page introuvable », avec `noindex`. La page part en streaming, et le statut est déjà envoyé quand `notFound()` arrive : c'est le comportement documenté de Next.js. Un 404 strict demanderait de vérifier l'identifiant dans `proxy.ts`, que la documentation réserve aux vérifications rapides.
- **Un atelier publié reste dans la mémoire du navigateur.** Il apparaît dans Mes ateliers, mais ni dans le catalogue ni dans une fiche : ces pages sont rendues sur le serveur, qui ne le connaît pas. Il les rejoindra avec l'API de BC02.
- **Pas de tests Vitest ici.** Ils couvrent le projet Vite, dont la logique est la même. Ici, ESLint, `next build` et les parcours ci-dessus vérifient ce que la transformation a changé.

---

*Écrit avec un assistant de code (clause IA de la fiche EC02). `AGENTS.md`, posé par `create-next-app`, renvoie à la documentation de la version installée (`node_modules/next/dist/docs/`) : c'est elle qui a été lue, pas un tutoriel des versions 13 ou 14.*
