# FM02 · TP 3 — Design system et maquette Figma : ce qui est prêt, ce qu'il reste à faire

> Quatre composants, trois paliers, six états, contrastes mesurés. Livrable : **le fichier Figma partagé**.

La maquette se fait dans **ton** compte Figma : personne d'autre ne peut la produire. Mais toute la matière existe déjà et elle est cohérente avec le code, puisque les deux partagent les mêmes jetons.

## Ce qui est prêt

| Exigence du TP 3 | Où c'est | État |
|---|---|---|
| 1. Jetons : 5 tailles de texte, un pas d'espacement, 5 couleurs, **ratio mesuré à côté** | `src/css/skillhub.css` (`:root`) et [`design-system.html`](design-system.html) §1–2 ; ratios dans [`fm02-contrastes.md`](fm02-contrastes.md) | ✅ |
| 2. Quatre composants et leurs variantes : bouton, champ, carte d'atelier, modale d'inscription ; six états pour les interactifs | [`design-system.html`](design-system.html) §3, rendus avec la vraie feuille de style | ✅ |
| 3. La landing page aux trois paliers, avec du contenu réel | La page elle-même ; [`design-system.html`](design-system.html) §4 ; captures `captures/palier-*.png` | ✅ |
| 4. Cas limites : titre de trois lignes, catalogue vide, champ en erreur | [`design-system.html`](design-system.html) §3 | ✅ |
| 5. Ordre de tabulation numéroté, du lien d'évitement au pied de page | [`ordre-tabulation-1280.png`](ordre-tabulation-1280.png), [`ordre-tabulation-375.png`](ordre-tabulation-375.png) ; tableau dans [`design-system.html`](design-system.html) §5 | ✅ |
| 6. Prototype joué par deux camarades, hésitations notées, une correction | À faire en séance | ⏳ |
| Le fichier Figma partagé | À faire dans ton compte | ⏳ |

## Construire le fichier Figma, pas à pas (environ 1 h 30)

### Option rapide : importer la page
L'extension gratuite **html.to.design** (menu Plugins de Figma) importe une page web en calques Figma.
1. Importe `https://rayan-madi.github.io/CDWS-2027-FilRouge/src/` **trois fois**, en choisissant les largeurs **360, 768 et 1280** : ce sont tes trois frames.
2. Importe `https://rayan-madi.github.io/CDWS-2027-FilRouge/docs/design-system.html` : tu récupères les jetons, les composants et leurs états.
3. **L'import ne suffit pas** : le cours demande de l'auto-layout, des composants et des variantes (règles du 4.3). Passe donc à l'étape suivante sur le résultat importé.

### Mettre le fichier aux normes du cours
1. **Variables** (panneau Local variables) : crée les jetons avec **les mêmes noms que le CSS** : `texte`, `texte-doux`, `accent`, `accent-fonce`, `accent-clair`, `erreur`, `succes`, `fond`, `fond-teinte` ; `t-xs` à `t-3xl` ; `e-1` à `e-16`. Dans la description de chaque couleur, recopie son ratio (par exemple « 6,66:1 sur fond »).
2. **Composants avec variantes** : `bouton` (propriété `état` = repos, survol, focus, actif, désactivé ; propriété `type` = principal, secondaire), `champ` (repos, focus, erreur, avec aide), `carte-atelier` (normale, titre long), `modale` (saisie, erreur, confirmée).
3. **Auto-layout partout** : c'est Flexbox. Carte d'atelier : vertical, espacement `e-2`, marge interne `e-6`. Liste des cartes : horizontal, espacement `e-6`, retour à la ligne.
4. **Noms lisibles** : `bouton/principal/focus`, jamais `Rectangle 47`.
5. **Ordre de tabulation** : pose des pastilles numérotées 1 à 23 sur la frame 1280, comme sur `ordre-tabulation-1280.png`.
6. **Prototype** : relie « Réserver », la modale, « Confirmer » et la confirmation, pour jouer le parcours de Jonny (TP 1).

## Les deux retours d'essai (à remplir en séance)

Fais jouer le parcours de Jonny (« réserver un atelier le soir ») à deux camarades, sans les aider.

| Camarade | Où a-t-il hésité ? | Ce que j'ai corrigé |
|---|---|---|
| 1 : _prénom_ | | |
| 2 : _prénom_ | | |
