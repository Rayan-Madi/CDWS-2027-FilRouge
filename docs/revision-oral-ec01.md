# Fiche de révision — défendre SkillHub à l'EC01

Les questions qu'un correcteur peut poser, la réponse courte, et **où le montrer** dans le code. Lis-la à voix haute la veille de l'oral : si une réponse ne te semble pas évidente, ouvre le fichier indiqué. Les questions de FM03 (JavaScript, TypeScript, asynchrone) sont à la fin.

## C2.1 — Structuration HTML sémantique (/6)

**Pourquoi un seul `h1`, et pourquoi pas le logo ?**
Le `h1` est le sujet de la page (« Reprenez la main sur votre reconversion »). Le logo est un lien vers le haut de page, pas le sujet. → `src/index.html`, section `#accroche`.

**Section ou `div` ?**
Une `section` porte un titre ; si je ne sais pas quel titre lui donner, c'est une `div`. Il y en a cinq, et chacune a une raison qui n'est pas un sens : `.page` (la grille de page), le bloc texte de l'accroche (une colonne de la grille), la zone où le catalogue insère une panne, le bloc « aucun atelier » (montré ou caché d'un coup) et le contenu de la modale (pour reconnaître un clic sur le fond). Les filtres, eux, sont devenus un `<form role="search">` en FM03.

**Pourquoi des `article` pour les ateliers ?**
Une fiche d'atelier garde son sens sortie de la page : c'est un contenu autonome.

**Pourquoi le pied de page n'est pas une `nav` ?**
Trois liens de confort ne font pas une navigation majeure ; une deuxième `nav` diluerait la principale. → `docs/tp1-erreurs-commentees.md`.

**Comment tu as validé ?**
Validateur W3C, 0 erreur, 0 avertissement → `docs/validateur-w3c.png`. Mais valide ne veut pas dire bon : le validateur vérifie la grammaire, pas le sens.

## C1.1 — Responsive sans framework (/8)

**Mobile-first, ça veut dire quoi dans ton code ?**
Le cas téléphone s'écrit sans media query ; les paliers **ajoutent** en `min-width`, en `em` (48em, 64em), pour suivre la taille de texte du visiteur. → fin de `src/css/skillhub.css`.

**Comment tu as choisi tes points de rupture ?**
À l'écran, pas sur une fiche d'appareil : 48em, c'est là où les quatre liens tiennent sur une ligne à côté du logo ; 64em, là où les lignes de l'accroche deviennent trop longues.

**Pourquoi `minmax(0, 1fr)` et pas `1fr` ?**
Une colonne `1fr` ne descend jamais sous la largeur de son contenu le plus large : la page débordait à 375 px. C'est un bug que j'ai rencontré et corrigé.

**Les cartes passent de 3 à 1 colonne sans media query : comment ?**
`repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` : autant de colonnes que la place en autorise, chacune d'au moins 16 rem.

**Comment tu prouves qu'il n'y a pas de débordement ?**
`scrollWidth === innerWidth` mesuré à 320, 375, 800 et 1280 px ; captures dans `docs/captures/`.

## C1.2 — Accessibilité (/6)

**Montre-moi un attribut ARIA utile, et un que tu as évité.**
Utile : `aria-expanded` sur le bouton du menu, écrit par la seule fonction qui rend l'affichage (`src/ts/menu.ts`, `rendre()` ; en FM02 c'était `ouvrirMenu` dans `skillhub.js`). Évité : aucun `role` sur un élément natif. La première règle d'ARIA, c'est de ne pas s'en servir quand le HTML suffit : les boutons « Réserver » sont de vrais `<button>`.

**Pourquoi `String(ouvert)` ?**
`aria-expanded` attend la chaîne « true » ou « false ». Et `getAttribute` rend une chaîne : « false » est une chaîne non vide, donc **vraie** dans un `if`. D'où la comparaison `=== "true"`.

**Ta modale : pourquoi `showModal()` et pas `show()` ?**
`showModal()` apporte gratuitement le focus dans la modale, Échap qui ferme, et le reste de la page inerte. Ce que j'ajoute : rendre le focus au bouton « Réserver » à la fermeture (événement `close`), et fermer la modale d'un clic sur le fond, que `<dialog>` ne fait pas seul.

**Comment les erreurs de formulaire sont-elles annoncées ?**
Le message est dans une zone reliée au champ par `aria-describedby`, avec `aria-live="polite"` ; `aria-invalid="true"` marque le champ ; le focus va au premier champ fautif. La saisie n'est jamais effacée.

**Tes contrastes, tu les as vérifiés comment ?**
Mesurés par la formule WCAG, pas à l'œil : `node outils/contrastes.js`. Les 17 paires passent ; les ratios sont écrits dans le CSS à côté de chaque couleur.

**Lighthouse donne 100 : c'est donc accessible ?**
Non. Un outil automatique voit au mieux un tiers des critères. **Deux preuves dans mon projet :** au focus, le texte d'« Annuler » était un instant blanc sur blanc (axe ne le voyait qu'une fois sur six) ; et sur mobile, le repère « navigation » disparaissait pour le lecteur d'écran (vu dans l'arbre d'accessibilité, invisible pour Lighthouse). → `docs/fm02-tp4-accessibilite.md`.

**Qu'est-ce qui reste améliorable ?**
Test complet au lecteur d'écran NVDA, gestion des erreurs serveur (il faut un back-end), vraie page de conditions, photos sous licence libre. → section 6 du rapport.

## UX (FM02)

**À quoi servent tes personas ?**
À trancher des décisions. Jonny, budget serré, sur téléphone : prix et niveau sur la carte, modale courte. Mélanie, « process trop long » et « charge mentale » : lien formateur qui présélectionne son profil, inscription en un écran. **Ce sont des proto-personas** : des hypothèses assumées, pas encore des entretiens, et le document le dit.

**Un exemple de décision prise grâce au parcours utilisateur ?**
Étape 3 du parcours de Jonny : le bouton « Réserver » perdait l'atelier choisi. D'où la modale qui reprend le titre, la date et le prix (heuristique 6 : reconnaître plutôt que se souvenir).

## Performance (FM01)

**Pourquoi l'image d'accroche n'est pas en `loading="lazy"` ?**
C'est elle qui fait le LCP : la retarder retarderait l'élément le plus visible. Les photos des formateurs, en bas de page, le sont.

**Le geste qui a fait passer la performance de 97 à 99 ?**
Une variante 700 px de l'image d'accroche et un `sizes` qui décrit la largeur réellement affichée : le mobile télécharge 28 Kio au lieu de 33. → `docs/tp2-bilan-performance.md`.

## FM03 — JavaScript, TypeScript, asynchrone (C04, C05)

**La délégation, c'est quoi ? Montre-moi.**
Un écouteur sur le parent au lieu d'un par enfant : l'événement remonte, `closest()` retrouve le bouton visé (le clic a pu toucher l'icône). → `src/ts/menu.ts`, l'écouteur `click` de la `<nav>` : il sert le bouton « Menu », le sous-menu « Ateliers » et tous les liens. Preuve : le test relève **un** écouteur sur la `nav`, **aucun** sur ses boutons (onglet « Écouteurs d'événements » des outils de développement).

**Pourquoi sortir l'état du DOM ?**
Si je lis `aria-expanded` pour savoir si c'est ouvert, il y a deux vérités, l'attribut et l'affichage, et elles finissent par diverger. Maintenant : une variable `etat`, un seul `majEtat()` qui la change, un seul `rendre()` qui écrit le DOM. L'écran est le reflet de l'état, jamais l'inverse.

**Pourquoi l'écouteur Échap n'existe-t-il que menu ouvert ?**
Il ne sert à rien sinon. Il est posé à l'ouverture avec le `signal` d'un `AbortController`, avec le clic dehors, et un seul `abort()` retire les deux. `removeEventListener` avec deux fonctions fléchées « identiques » ne retire rien : ce ne sont pas les mêmes fonctions.

**`checkValidity()`, puis tes règles : lesquelles, et pourquoi ?**
Le natif d'abord, gratuit. Puis deux trous qu'il laisse : un nom fait d'espaces passe `required`, et `a@b` passe `type="email"`. Je les bouche par `setCustomValidity`. Le message va à côté du champ, dans la zone désignée par `aria-describedby`. → `src/ts/validation.ts`.

**Explique ta gestion du focus, sans le code.**
→ `docs/fm03-tp1-comportement.md`, § 8, les cinq phrases. Le fil : le focus ne disparaît jamais (je le pose ailleurs avant que son élément disparaisse), on revient d'où l'on vient (modale fermée → la carte, retrouvée par l'identifiant), et à l'erreur, au premier champ fautif.

**Pourquoi des modules, et un seul point d'entrée ?**
Un fichier, une responsabilité, une portée à lui (plus de variables globales qui s'écrasent). La page ne charge que `js/main.js`, et `type="module"` implique `defer`. « Un seul fichier massif » est une erreur listée de l'EC02.

**Qu'a trouvé TypeScript dans ton code ?**
72 erreurs dans mes modules, 79 dans le code de FM02. Cinq cachaient un vrai bug : un champ nommé « constructor » toujours invalide (`REGLES[champ.name]` trouve ce qu'un objet hérite : d'où les `Map`), `querySelector("#")` qui lève une erreur, `FormData.get().trim()` sur `null`, un garde-fou qui ne protégeait pas les fonctions du menu, `textContent = nombre`. → `docs/fm03-tp2-typescript.md`.

**Zéro `any` : comment tu le prouves ?**
Un test lit chaque `.ts` et refuse `any`, `as`, `!` et `@ts-ignore`. Et un `any` caché que le test ne voit pas : `formulaire.nom` est typé `any` par le DOM. Je lis donc les formulaires par `FormData`.

**« Le type est une promesse » : ça veut dire quoi ?**
TypeScript n'existe plus à l'exécution. Ce qui vient du dehors (le JSON) n'est pas vérifié par le type : je le vérifie avec une garde, `estAtelier(valeur: unknown): valeur is Atelier`. Un prix reçu en chaîne est refusé. → `src/ts/api.ts`.

**`fetch` sur un 404 : que se passe-t-il ?**
La promesse est **tenue** : une réponse est arrivée. `fetch` ne rejette que sur une panne réseau. D'où `if (!reponse.ok) throw …` : sans lui, un 500 deviendrait un catalogue vide.

**Une annulation, c'est une panne ?**
Non. Si c'est moi qui annule (« Réessayer » relance, la requête précédente est abandonnée), l'`AbortError` est ignorée. Le délai maximal (8 s), lui, est une vraie panne : « le serveur met trop de temps ».

**Les quatre états, et l'annonce de chacun ?**
Chargement : cartes fantômes à la taille des vraies, `aria-busy`, « Chargement… » poli. Vide : poli, ce n'est pas une panne, avec « Tout afficher ». Erreur : `role="alert"`, qui interrompt, avec « Réessayer », et le code HTTP dans la console seulement. Succès : le compteur. → `docs/fm03-tp3-catalogue.md` et ses captures.

**Pourquoi ton compteur dit « 2 ateliers · niveau débutant · par prix croissant » ?**
Une zone `role="status"` n'annonce qu'un texte qui change. « 12 ateliers » ne changerait pas quand on change le tri : rien ne serait annoncé. En nommant chaque critère, chaque changement change le texte.

**L'anti-rebond, à quoi bon si le filtre est local ?**
Rien ne part au serveur, mais sans lui, chaque lettre referait le rendu et ferait annoncer le compteur : « 14 ateliers, 9 ateliers, 3 ateliers… » pendant qu'on tape. Mesuré : « accessibilite » donne une annonce au lieu de treize.

**Pourquoi le JavaScript compilé est-il dans le dépôt ?**
GitHub Pages sert les fichiers tels quels, sans étape de construction. L'intégration continue recompile à chaque PR et refuse si `src/js` n'est pas exactement ce que produit `tsc`.

**Et sans JavaScript ?**
Le menu est déplié, trois ateliers sont écrits dans la page avec un lien vers le formulaire, et la validation est celle du navigateur. Si le module ne se charge pas (page ouverte en `file://`), la classe `js` est retirée : même résultat.
