# FM04 · SkillHub en React — TP 1 (et le TP 2 en avance)

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

## Pris en avance sur le TP 2 (24/11)

Ce qui est déjà fait :
- les routes, avec un layout, le paramètre `:id`, un garde et la route `*` ;
- le **filtre dans l'URL** (`useSearchParams`) ;
- le **contexte des inscriptions** et son hook maison ;
- **Mon espace** (`Dashboard`), avec les ateliers suivis, les places et la désinscription par une modale ;
- le **formulaire contrôlé** « Créer mon compte » ;
- `TitreDeVue`, qui donne le focus, le titre et le défilement.

Ce qui reste pour le TP 2 : le côté formateur, `CreerAtelier` et `MesAteliers`.

## Vérifications

- `npm run build` : `tsc -b` passe sans erreur, puis `dist/` est produit. Taille : **298,7 ko de JavaScript, 94,4 ko compressés en gzip**, et 17,7 ko de CSS.
- `npm test` : **18 tests** Vitest + Testing Library. Ils couvrent la carte, les quatre états du catalogue (404 compris), les critères lus dans l'URL, le garde, la page introuvable, le formulaire et ses erreurs reliées, le menu et Échap, et un hook utilisé hors de son fournisseur.
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

## À refaire moi-même avant l'oral

- Le même parcours au clavier, sur `npm run preview`.
- Expliquer quatre choses :
  - pourquoi `key={atelier.id}` et jamais l'index ;
  - pourquoi la liste filtrée n'est pas un `useState` ;
  - où vit chaque donnée (le tableau de la diapo 50) ;
  - ce que `Layout` répare après une navigation.

---

*Fait avec un assistant de code. Ce qui est vérifié : la compilation, les 18 tests, le linter, le parcours au clavier sur le résultat construit.*
