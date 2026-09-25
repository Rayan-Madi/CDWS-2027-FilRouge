# Fiche de révision — défendre SkillHub à l'EC01

Les questions qu'un correcteur peut poser, la réponse courte, et **où le montrer** dans le code. Lis-la à voix haute la veille du 02/10 : si une réponse ne te semble pas évidente, ouvre le fichier indiqué.

## C2.1 — Structuration HTML sémantique (/6)

**Pourquoi un seul `h1`, et pourquoi pas le logo ?**
Le `h1` est le sujet de la page (« Reprenez la main sur votre reconversion »). Le logo est un lien vers le haut de page, pas le sujet. → `src/index.html`, section `#accroche`.

**Section ou `div` ?**
Une `section` porte un titre ; si je ne sais pas quel titre lui donner, c'est une `div`. Il y en a quatre, et chacune a une raison qui n'est pas un sens : `.page` (la grille de page), le bloc texte de l'accroche (une colonne de la grille), le groupe des filtres (caché d'un coup sans JavaScript) et le contenu de la modale (pour reconnaître un clic sur le fond).

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
Utile : `aria-expanded` sur le bouton du menu, mis à jour dans la même fonction que l'affichage (`src/js/skillhub.js`, `ouvrirMenu`). Évité : aucun `role` sur un élément natif. La première règle d'ARIA, c'est de ne pas s'en servir quand le HTML suffit : les boutons « Réserver » sont de vrais `<button>`.

**Pourquoi `String(ouvert)` ?**
`aria-expanded` attend la chaîne « true » ou « false ». Et `getAttribute` rend une chaîne : « false » est une chaîne non vide, donc **vraie** dans un `if`. D'où la comparaison `=== "true"`.

**Ta modale : pourquoi `showModal()` et pas `show()` ?**
`showModal()` apporte gratuitement le focus dans la modale, Échap qui ferme, et le reste de la page inerte. Ma seule ligne en plus : rendre le focus au bouton « Réserver » à la fermeture (événement `close`).

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
