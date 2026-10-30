# SkillHub en React

Le tableau de bord SkillHub (EC02) : la landing de l'EC01 transposée en composants React, avec routes, état partagé et formulaire contrôlé. Module **BC01-FM04**, TP 1 et partie du TP 2.

**React 19 · TypeScript 7 (strict) · Vite 8 · React Router 8 · Tailwind CSS 4**

```bash
cd react
npm install
npm run dev      # http://localhost:5173
npm test         # 18 tests (Vitest + Testing Library)
npm run build    # tsc -b (types) puis vite build → dist/
npm run preview  # sert le résultat construit : c'est lui qu'on vérifie, pas le serveur de dev
```

## Choix du framework

| | React | Vue 3 | Angular |
|---|---|---|---|
| Nature | bibliothèque de rendu ; le reste s'assemble | framework progressif | framework complet et imposé |
| Syntaxe | JSX : du JavaScript qui produit du balisage | template proche du HTML | template + TypeScript obligatoire |
| Courbe d'entrée | moyenne : peu de concepts, beaucoup de choix | la plus douce | la plus raide (injection, RxJS) |
| Écosystème | le plus large, le plus fragmenté | cohérent, plus restreint | tout est officiel |
| En alternance (Île-de-France) | le plus demandé | présent | grande entreprise |

**React**, parce que :
- c'est ce que les entreprises d'accueil demandent le plus ;
- JSX est du JavaScript : le code de FM03 (`types.ts`, le chargement, le filtre, les formats) se réutilise **sans modification** ;
- SkillHub est petit : un framework complet comme Angular serait surdimensionné. En échange, on choisit soi-même le routeur (React Router) et le style (Tailwind).

**Vite plutôt que Next.js** pour ces TP : une application à page unique, servie par n'importe quel hébergeur de fichiers statiques. Next.js (rendu serveur, routes en dossiers) arrive au TP 4.

## Justification de l'architecture

```
src/
├── main.tsx · Application.tsx   le point d'entrée, et les fournisseurs autour du routeur
├── router/      routes.tsx (le SEUL endroit où les routes sont déclarées), chemins.ts, ExigeConnexion.tsx (le garde)
├── views/       une vue par route : Accueil, Catalogue, FicheAtelier, Formateurs, Inscription, Dashboard, PageIntrouvable
├── components/  des briques qui reçoivent des props et préviennent leur parent ; elles ne savent rien des routes
├── contexts/    Compte, Inscriptions : un fournisseur + un hook maison chacun
├── hooks/       useAteliers (les 4 états du chargement), useCriteres (le filtre dans l'URL), useActionsInscription
├── services/    api.ts et serveur-simule.ts (repris de FM03), formateurs.ts
├── utils/       la logique pure : filtre.ts et format.ts (FM03), validation.ts, messages.ts
├── donnees/     ateliers.json (FM03), formateurs.json
└── types.ts     repris de FM03, à l'octet près
```

- **Où vit chaque donnée** (diapo 50) :
  - les **critères du filtre** dans l'**URL** (`?niveau=debutant&soir=oui`), pour que l'adresse se partage et survive au rechargement ;
  - le **compte** et les **inscriptions** dans un **contexte**, parce qu'ils sont lus par la navigation, les cartes, le garde et le tableau de bord ;
  - le reste en `useState` local (menu ouvert, saisie d'un champ, envoi en cours).
- **Ce qui n'est pas un état :** la liste filtrée, le compteur, les places restantes. Ce sont des valeurs dérivées, recalculées à chaque rendu.
- **Les routes :**

  | Route | Vue |
  |---|---|
  | `/` | Accueil |
  | `/ateliers` | Catalogue |
  | `/ateliers/:id` | FicheAtelier |
  | `/formateurs` | Formateurs |
  | `/inscription` | Inscription |
  | `/mon-espace` | Dashboard, derrière le garde `ExigeConnexion` |
  | `*` | PageIntrouvable |

  Un `Layout` parent enveloppe toutes les vues.
- **Ce que le routage casse, réparé :** à chaque changement de page, `Layout` porte le focus sur le `h1` et remonte en haut, sauf au retour arrière. `TitreDeVue` change le titre de l'onglet. La route `*` évite l'écran blanc.
- **Pas de back-end avant BC02 :** l'état vit en mémoire, donc un rechargement repart de zéro. Le serveur simulé de FM03 répond en 800 ms et refuse ce qu'un vrai serveur refuserait. Le garde est un confort : c'est le serveur qui doit refuser.

## Organisation des composants

| Composant | Rôle |
|---|---|
| `CarteAtelier` | un atelier. **Aucun état** : il reçoit tout en props et prévient le parent par `onInscrire(id)` et `onDesinscrire(id)` |
| `ActionInscription` | le bouton « S'inscrire » / « Se désinscrire », partagé par la carte et la fiche ; le même bouton avant, pendant et après l'envoi, pour que le focus ne bouge pas |
| `ListeAteliers` | la grille, `key={atelier.id}` et jamais l'index ; elle branche les cartes sur les inscriptions |
| `FiltresAteliers` | `<form role="search">` ; la frappe part dans l'URL après 300 ms de calme |
| `CartesFantomes` | la place réservée pendant le chargement (`aria-hidden`) |
| `Modale` | le `<dialog>` de FM02 (`showModal()` : focus piégé, Échap) ; le focus revient au déclencheur |
| `Champ` | étiquette, aide et erreur reliées au champ (`useId`, `aria-describedby`, `aria-invalid`) |
| `Navigation` | menu mobile (`aria-expanded`), sous-menu « Ateliers », `NavLink` qui pose `aria-current="page"`, Échap qui rend le focus |
| `TitreDeVue` | le `h1` de chaque vue (`tabIndex={-1}`) et le titre de l'onglet |
| `Layout` | lien d'évitement, en-tête, `Outlet`, pied ; focus et défilement après navigation |

Le style suit le design system de FM02 :
- `tailwind.config.js` porte les mêmes jetons (mêmes hexadécimaux, ratios en commentaire) ;
- les classes nues visent le téléphone, et `sm:`, `md:`, `lg:`, `xl:` enrichissent, comme le mobile-first de FM01 ;
- la grille passe de 1 colonne à 2, 3 puis 4 ;
- les cibles font au moins 44 px.

Tailwind 4 exige Chrome et Edge 111, Safari 16.4 et Firefox 128.

---

*Écrit avec un assistant de code (clause IA de la fiche EC02).*
