# FM04 · SkillHub en React — TP 1, 2 et 3

Le projet : [`react/`](../react/). L'architecture est décrite dans son [README](../react/README.md).

## TP 1, point par point

| Consigne | Où |
|---|---|
| 1. Vite + React + TS, Tailwind, rangement exact | `react/` : `src/components`, `src/views`, `src/router`, `src/hooks`, `src/services` (et `contexts`, `utils`) |
| 2. `types.ts` et le chargement de FM03 SANS modification | `src/types.ts` identique ; `api.ts`, `filtre.ts`, `format.ts` identiques à leurs chemins d'import près |
| 3. `CarteAtelier` : props typées, aucun état, `onInscrire` | `src/components/CarteAtelier.tsx` |
| 4. `Catalogue` : recherche en état, liste en valeur dérivée, key stable, compteur en aria-live | `src/views/Catalogue.tsx`, `src/components/ListeAteliers.tsx` |
| 5. Jetons de FM02 dans `tailwind.config.js`, mêmes hexadécimaux | `react/tailwind.config.js` |
| 6. Clavier, puis `npm run build` et le résultat construit | ci-dessous |

## TP 2 (24/11), fait en avance

| Consigne | Où |
|---|---|
| 1. Routes dans `src/router/`, vues aux noms de la fiche (`Dashboard`, `MesAteliers`, `CreerAtelier`), route `*` | `routes.tsx` ; `views/Dashboard.tsx`, `views/MesAteliers.tsx`, `views/CreerAtelier.tsx`, `views/PageIntrouvable.tsx` |
| 2. Le filtre du catalogue dans l'URL | `hooks/useCriteres.ts` (`useSearchParams`, `replace`) |
| 3. Le contexte des inscriptions et son hook maison | `contexts/Inscriptions.tsx` (`useInscriptions`) |
| 4. Le tableau de bord : ateliers suivis, places, désinscription | `views/Dashboard.tsx`, confirmation dans une modale |
| 5. Un formulaire contrôlé « créer un atelier », côté formateur | `views/CreerAtelier.tsx`, règles dans `utils/atelier.ts`, mécanique partagée `hooks/useFormulaire.ts` |
| 6. `TitreDeVue` dans chaque vue, grille vérifiée à 360, 768 et 1280 px | `components/TitreDeVue.tsx` ; relevé ci-dessous |

En détail :
- les routes, avec un layout, le paramètre `:id`, un garde et la route `*` ;
- le **filtre dans l'URL** (`useSearchParams`) ;
- le **contexte des inscriptions** et son hook maison ;
- **Mon espace** (`Dashboard`), avec les ateliers suivis, les places et la désinscription par une modale ;
- deux **formulaires contrôlés** sur la même mécanique (`useFormulaire`) : « Créer mon compte » et « Créer un atelier ». Chaque champ est jugé quand on le quitte, avec un message relié au champ ; à l'envoi, le focus va au premier champ fautif, et le bouton est en `aria-disabled` pendant l'envoi ;
- **Mes ateliers** et **Créer un atelier**, derrière un second garde : connecté ET formateur. Un atelier publié apparaît dans Mes ateliers, dans le catalogue (15 ateliers au lieu de 14) et a sa fiche ;
- `TitreDeVue`, qui donne le focus, le titre et le défilement.

Grille relevée dans Chrome sur le build, sans débordement horizontal :

| Largeur | Catalogue | Mes ateliers | Créer un atelier |
|---|---|---|---|
| 360 px | 1 colonne | 1 colonne | 1 colonne |
| 768 px | 2 colonnes | 2 colonnes | 2 colonnes |
| 1280 px | 4 colonnes | 3 colonnes | 2 colonnes |

Le formulaire « Créer un atelier » se remplit entièrement au clavier, date comprise. Envoi vide : focus sur le titre, 8 champs signalés. Après publication, focus sur le `h1` « Mes ateliers ».

## TP 3, point par point

| Consigne | Où, et ce qui a été relevé |
|---|---|
| 1. Une API locale, son adresse dans une variable `VITE_*` | `npm run api` : json-server sur `src/donnees/ateliers.json`, sans copie à la main (`api/preparer.mjs` fabrique `db.json`). `VITE_API_URL` dans `.env.development`, lue par `services/config.ts`. En développement, le catalogue est bien lu sur `http://localhost:3001/ateliers` ; API arrêtée, il affiche « Impossible de charger les ateliers… » et « Réessayer » |
| 2. `useAteliers` : union discriminée, `AbortController`, nettoyage, module de FM03 TEL QUEL | `hooks/useAteliers.ts` ; `api.ts` n'a pas bougé, il reçoit l'adresse par son option `url` |
| 3. Les quatre états dans un `switch` | `views/Catalogue.tsx` : `aria-busy`, `role="alert"` et « Réessayer », phrase du vide, compteur annoncé ; un état oublié ne compile pas (`never`) |
| 4. `lazy` + `Suspense`, la taille du paquet avant et après | voir ci-dessous |
| 5. Le build servi, les DEUX rapports exportés | [`rapports/fm04/`](rapports/fm04/) : voir ci-dessous |
| 6. Rechargement direct d'une URL profonde, parcours clavier complet | voir ci-dessous |

**Le paquet, avant et après le découpage** (`npm run build`, JavaScript chargé au premier écran) :

| | JavaScript initial | gzip |
|---|---|---|
| Avant (TP 2) | 308,5 ko | 96,7 ko |
| Après | 301,6 ko | 95,5 ko |
| Morceaux à part | Dashboard 2,1 ko · MesAteliers 1,6 ko · CreerAtelier 6,1 ko | 1,0 · 0,8 · 2,3 ko |

Le gain est réel mais modeste : 7 ko. La diapo 5.3 annonce « la moitié du paquet » pour une application dont les vues pèsent lourd. Ici, l'essentiel du paquet est React, React DOM et React Router, qui servent à toutes les pages. Les trois vues découpées sont petites. À retenir : on mesure avant de promettre.

**Les rapports**, Lighthouse 13.6 sur le build servi (`vite preview`), en émulation mobile :

| Fichier | Page | Scores |
|---|---|---|
| [`lighthouse-accessibilite.report.html`](rapports/fm04/lighthouse-accessibilite.report.html) | `/ateliers` | Accessibilité **100** |
| [`lighthouse-structuration.report.html`](rapports/fm04/lighthouse-structuration.report.html) | `/` | Performance **98** · Bonnes pratiques **100** · SEO **100** |

Les mêmes rapports existent en JSON à côté, et j'ai aussi passé l'accessibilité sur `/`, `/inscription`, une fiche, `/formateurs` et la page introuvable : 100 partout. Les pages de l'espace ne s'auditent pas ainsi, parce qu'elles demandent un compte et que le compte vit en mémoire.

Le premier passage donnait Performance 87 et SEO 92. Deux défauts ont été corrigés avant l'export :
- **Décalage de mise en page (CLS 0,155 → 0).** La police Sora arrivait après le JavaScript : le texte de l'accroche changeait de hauteur et l'image sautait. Les polices passent dans `public/polices/` et sont préchargées par `index.html`.
- **`robots.txt` en erreur.** Le serveur renvoyait `index.html` à sa place. Il y a maintenant un vrai `public/robots.txt`.

Ce qui reste signalé, et pourquoi on le garde :
- **L'image d'accroche n'est découverte qu'après le JavaScript.** C'est le prix d'une page rendue dans le navigateur. Le TP 4 (Next.js, rendu serveur) le règle.
- **Environ 45 ko de JavaScript inutilisé au premier écran.** Ce sont des morceaux de React et de React Router qui servent ailleurs.

**Rechargement direct et clavier** (Chrome, sur le build) :
- `/ateliers/git-initiation`, `/ateliers?niveau=debutant` et `/nimporte/quoi` rechargés : HTTP 200 et la bonne vue, filtre compris. `/mon-espace` rechargé : HTTP 200, puis l'inscription, puisque le compte vivait en mémoire. Jamais de 404, parce que `vite preview` renvoie `index.html` pour toute adresse inconnue, comme doit le faire l'hébergeur (diapo 5.1).
- Morceaux de l'espace retenus 1,5 s exprès : la page quittée reste affichée, le bouton dit « Inscription en cours… » jusqu'au bout, puis le focus arrive sur « Bonjour Léa ». Ce test a révélé un défaut, corrigé : pendant l'attente, Inscription affichait « Vous avez déjà un compte ».
- Le parcours au clavier du TP 1, rejoué en entier : aucune erreur en console.

## Vérifications

- `npm run build` : `tsc -b` passe sans erreur, puis `dist/` est produit. Taille : **308,5 ko de JavaScript, 96,7 ko compressés en gzip**, et 17,9 ko de CSS (avant le découpage du TP 3).
- `npm test` : **26 tests** Vitest + Testing Library. Ils couvrent la carte, les quatre états du catalogue (404 compris), les critères lus dans l'URL, le garde, la page introuvable, le formulaire et ses erreurs reliées, le menu et Échap, et un hook utilisé hors de son fournisseur, le focus après une navigation ou une désinscription, et le côté formateur (garde par profil, envoi vide, publication jusqu'au catalogue et à la fiche).
- `npm run lint` : Oxlint ne relève rien.
- Aucun débordement horizontal à 375 et 1280 px, sur les cinq vues, et aucune erreur en console.
- **Le parcours au clavier**, rejoué sur le résultat construit (`vite preview`), dans Chrome :
  1. Tab : « Aller au contenu », puis le logo, « Accueil », « Ateliers ».
  2. Entrée sur « Ateliers » : le focus arrive sur le `h1` « Les ateliers du moment », et l'onglet affiche « Les ateliers · SkillHub ».
  3. Tab jusqu'à « Niveau », puis flèche bas : l'adresse devient `?niveau=debutant`, et la région annonce « 6 ateliers · niveau débutant · par date ».
  4. Tab jusqu'à « S'inscrire » sur la première carte, Entrée : sans compte, on arrive sur « Créer mon compte », focus sur son `h1`.
  5. On remplit le formulaire au clavier (nom, adresse, profil, case cochée à l'Espace), puis Entrée sur « Créer mon compte » : le bouton affiche « Inscription en cours… ».
  6. On revient sur `/ateliers?niveau=debutant`, filtre conservé, focus sur le `h1`.
  7. « S'inscrire », Entrée : « Inscription en cours… », puis « Se désinscrire ». Le focus reste sur ce même bouton du début à la fin.

## Relecture du 30/10

Cinq défauts trouvés en relisant, chacun corrigé (les deux premiers ont d'abord un test qui échoue) :

- **La fiche perdait le focus** une fois l'atelier chargé : le `h1` « Chargement… » était remplacé par un autre élément. Un même cadre pour tous les états garde maintenant le même `h1`, seul son texte change.
- **Se désinscrire du dernier atelier suivi**, dans Mon espace, retirait la liste avec la modale encore ouverte : aucun événement `close`, focus perdu. La modale rend le focus quand elle est démontée ouverte.
- **Échap et le clic sur le fond** fermaient la modale pendant l'envoi, alors que les deux boutons étaient gardés. Ils sont bloqués pendant l'envoi.
- **Dans Mon espace, les titres des cartes** étaient des `h2` sous le `h2` « Mes ateliers ». Ce sont maintenant des `h3`.
- **« Réessayer »** (fiche et Mon espace) disparaissait en emportant le focus. Le focus part maintenant sur le `h1`, comme dans le catalogue.

Vérifié aussi : Tailwind écrit bien les calculs des valeurs arbitraires (`min(32rem, 100% - 2rem)`, avec les espaces), et le parcours rejoué dans Chrome sur le build ne relève aucune erreur en console.

## À refaire moi-même avant l'oral

- Le même parcours au clavier, sur `npm run preview`.
- Expliquer quatre choses :
  - pourquoi `key={atelier.id}` et jamais l'index ;
  - pourquoi la liste filtrée n'est pas un `useState` ;
  - où vit chaque donnée (le tableau de la diapo 50) ;
  - ce que `Layout` répare après une navigation.

---

*Fait avec un assistant de code. Ce qui est vérifié : la compilation, les 26 tests, le linter, le parcours au clavier sur le résultat construit.*
