# FM03 · TP 1 — le code de FM02, annoté ligne par ligne

Le fichier annoté est `outils/figma-skillhub/tests/fm02/skillhub.js` (329 lignes), copie figée de `src/js/skillhub.js` au commit `3d96c47` (identique, aux fins de ligne près).
La page le chargeait comme un script classique, dans le `<head>` : `<script src="js/skillhub.js" defer></script>`. `defer` le télécharge pendant l'analyse du HTML et ne l'exécute qu'une fois le document entièrement analysé, avant `DOMContentLoaded` : c'est pour cela que le fichier appelle `querySelector` directement, sans attendre d'événement.
Les numéros sont ceux du fichier ; je saute les lignes vides et je regroupe les lignes qui ne font que fermer un bloc.
Annotations rédigées avec un assistant de code, relues ligne à ligne : je dois pouvoir redire chacune sans le document.

## En-tête du fichier (L1–3)

- **L1–3** commentaire : JavaScript natif, chargé en `defer` ; amélioration progressive, c'est-à-dire que sans ce fichier la page reste complète (menu visible, liens « Réserver » vers le formulaire, validation par le navigateur). Ça tient parce que le CSS ne replie le menu que sous la classe `js`, posée sur `<html>` par un petit script en ligne du `<head>`, et parce que les liens « Réserver » pointent vers `#inscription`.

**Ce que FM03 change.** La page ne charge plus que `<script type="module" src="js/main.js">`, le JavaScript compilé depuis `src/ts/`. `type="module"` implique `defer` et donne à chaque fichier sa propre portée, alors qu'ici les `const` et `let` de haut niveau partagent la portée globale de la page.

## Menu mobile (L5–49)

- **L5** commentaire de section (« Menu mobile »).
- **L6** `const boutonMenu = document.querySelector(".menu-bouton");` — renvoie le premier élément de classe `menu-bouton`, ici le `<button aria-expanded="false" aria-controls="menu">` placé dans la `<nav>`, ou `null` s'il n'existe pas. `const` : la référence ne sera jamais réaffectée (l'élément, lui, peut changer).
- **L7** `const menu = document.querySelector("#menu");` — la liste `<ul class="navigation__liste" id="menu" data-ferme>`, celle que le bouton désigne par `aria-controls="menu"`.
- **L8** `const petitEcran = window.matchMedia("(max-width: 47.99em)");` — renvoie un objet `MediaQueryList` dont la propriété `matches` dit, au moment où je la lis, si la requête est vraie. 47.99em est juste sous le palier `min-width: 48em` du CSS, à partir duquel le bouton disparaît et la liste s'affiche en ligne.
- **L10–11** commentaire : l'état annoncé (`aria-expanded`) et l'état réel (la liste repliée ou non) changent dans la même fonction ; séparés, ils finiraient par diverger et l'attribut mentirait.
- **L12** `function ouvrirMenu(ouvert) {` — déclaration de fonction (remontée par le moteur, donc appelable avant sa ligne) ; `ouvert` est un booléen : `true` pour ouvrir, `false` pour fermer.
- **L13** `boutonMenu.setAttribute("aria-expanded", String(ouvert)); // une chaîne, pas un booléen` — écrit l'attribut que le lecteur d'écran lit pour annoncer « développé » ou « réduit ». Un attribut HTML est toujours une chaîne : `aria-expanded` attend `"true"` ou `"false"`. `setAttribute` convertirait tout seul, mais `String()` rend la conversion visible, et TypeScript l'exige (sa signature n'accepte qu'une chaîne).
- **L14** `menu.toggleAttribute("data-ferme", !ouvert);` — sans second argument, `toggleAttribute` inverse la présence de l'attribut ; avec, il la force : `true` l'ajoute, `false` l'enlève, quel que soit l'état de départ. Menu ouvert, donc `data-ferme` retiré. La règle CSS `.js .navigation__liste[data-ferme] { display: none; }` fait le reste.
- **L15** `}` — ferme `ouvrirMenu`.
- **L17** `function menuOuvert() {` — lit l'état du menu… dans le DOM.
- **L18** `return boutonMenu.getAttribute("aria-expanded") === "true"; // "false" est une chaîne vraie` — `getAttribute` renvoie une chaîne (ou `null` si l'attribut manque). Or `"false"` est une chaîne non vide, donc « truthy » : un simple `if (boutonMenu.getAttribute("aria-expanded"))` serait toujours vrai. D'où la comparaison stricte à `"true"`, qui renvoie un vrai booléen.
- **L19** `}` — ferme `menuOuvert`.
- **L21** `if (boutonMenu && menu) {` — garde : si l'un des deux manque, `querySelector` a rendu `null`, et la première méthode appelée dessus lèverait une `TypeError` qui arrêterait tout le script, blocs suivants compris. Le bloc ne s'exécute que si les deux existent.
- **L22** `ouvrirMenu(false);` — fixe l'état de départ : menu fermé, `aria-expanded="false"`, `data-ferme` présent, quoi que dise le HTML.
- **L24** `boutonMenu.addEventListener("click", () => {` — écoute le clic sur le bouton. Un `<button>` reçoit aussi `click` au clavier (Entrée, Espace) : rien à ajouter pour le clavier.
- **L25** `ouvrirMenu(!menuOuvert());` — bascule : lit l'état actuel, l'inverse, l'applique.
- **L26** `});` — ferme l'écouteur du bouton.
- **L28** commentaire : un lien choisi referme le menu sur petit écran.
- **L29** `menu.addEventListener("click", (evenement) => {` — un seul écouteur sur la `<ul>` pour tous ses liens : le clic sur un lien remonte (bouillonne) jusqu'à elle. `evenement` est l'objet `MouseEvent`.
- **L30** `if (evenement.target.closest("a") && petitEcran.matches) {` — `evenement.target` est l'élément exact touché, qui peut être un enfant du lien ; `closest("a")` part de cet élément (lui compris), remonte ses ancêtres et renvoie le premier `<a>`, ou `null`. Un clic sur le `<li>`, à côté d'un lien, ne ferme donc rien. `petitEcran.matches` : je ne ferme que sur petit écran, là où la liste est un panneau.
- **L31** `ouvrirMenu(false);` — referme. Le saut vers l'ancre a lieu quand même : rien n'est empêché.
- **L32–33** ferment le `if` et l'écouteur de la liste.
- **L35** commentaire : Échap referme le menu et rend le focus au bouton, sinon on est perdu au clavier.
- **L36** `document.addEventListener("keydown", (evenement) => {` — sur `document`, car au moment d'appuyer sur Échap le focus peut être n'importe où (sur un lien de la liste, sur le bouton).
- **L37** `if (evenement.key === "Escape" && menuOuvert()) {` — `key` donne la valeur logique de la touche (`"Escape"`). Si le menu est déjà fermé, je ne fais rien : sinon chaque Échap de la page enverrait le focus sur le bouton.
- **L38** `ouvrirMenu(false);` — referme.
- **L39** `boutonMenu.focus();` — si le focus était sur un lien de la liste, ce lien vient d'être masqué (`display: none`) et le focus serait perdu. Je le pose sur le bouton qui a ouvert le menu.
- **L40–41** ferment le `if` et l'écouteur `keydown`.
- **L43** commentaire : un clic en dehors de l'en-tête referme aussi.
- **L44** `document.addEventListener("click", (evenement) => {` — tout clic de la page finit par remonter jusqu'à `document`.
- **L45** `if (menuOuvert() && !evenement.target.closest(".entete")) {` — ferme seulement si le clic a eu lieu hors du `<header class="entete">`. C'est aussi ce qui protège le bouton : son clic remonte jusqu'ici juste après avoir ouvert le menu, mais sa cible est dans `.entete`, donc le menu ne se referme pas aussitôt.
- **L46** `ouvrirMenu(false);` — referme.
- **L47–49** ferment le `if`, l'écouteur du document, puis le `if (boutonMenu && menu)` de la L21.

**Ce que FM03 change.** Dans `src/ts/menu.ts`, un seul écouteur de clic délégué sur la `<nav>` (`closest("button[aria-controls]")`, puis `closest("a")`) sert le bouton, le nouveau sous-menu « Ateliers » et ses trois raccourcis, et les liens. L'état `{ menuOuvert, sousMenuOuvert }` vit dans une variable et une seule fonction `rendre()` l'écrit dans le DOM : on ne relit plus `aria-expanded` comme le fait `menuOuvert()`. Les écouteurs `keydown` et `click` du document ne sont posés que tant qu'un panneau est ouvert, avec le `signal` d'un `AbortController`, et retirés d'un seul `abort()` ; le focus qui quitte la `<nav>` referme tout.

## Validation des formulaires (L51–120)

- **L51–52** commentaire de section : la validation est un confort pour la personne, jamais une sécurité, car le serveur revalide.
- **L53** `const messages = {` — un objet littéral qui donne, pour chaque champ désigné par son attribut `name`, des messages en français rangés sous le nom des drapeaux de `ValidityState`. La clé est le `name` et non l'`id` : le champ de la modale a l'`id` `r-nom` mais le même `name="nom"`, il partage donc les messages.
- **L54** `nom: {` — les messages des champs `name="nom"`.
- **L55–56** `valueMissing: "Indiquez votre prénom et votre nom.",` puis `},` — `valueMissing` vaut `true` quand un champ `required` est vide ; L56 ferme l'entrée.
- **L57** `courriel: {` — les champs `name="courriel"`, de `type="email"`.
- **L58** `valueMissing: "Indiquez votre adresse électronique.",` — champ vide.
- **L59–60** `typeMismatch: "L'adresse doit ressembler à nom@exemple.fr.",` puis `},` — `typeMismatch` vaut `true` quand la valeur ne correspond pas au type, ici une saisie qui n'a pas la forme d'une adresse ; un champ vide n'est pas en `typeMismatch`, seulement en `valueMissing`. L60 ferme l'entrée.
- **L61** `profil: {` — le `<select name="profil">`.
- **L62–63** `valueMissing: "Choisissez votre profil.",` puis `},` — un `<select required>` est en `valueMissing` tant que l'option choisie a une valeur vide, ici « Choisissez » (`value=""`).
- **L64** `cgu: {` — la case des conditions d'utilisation.
- **L65–67** `valueMissing: "Vous devez accepter les conditions pour continuer.",` puis `},` et `};` — une case `required` non cochée est en `valueMissing` ; L66–67 ferment l'entrée puis l'objet.
- **L69–70** commentaire : le message s'écrit dans la zone reliée au champ par `aria-describedby`, et `aria-invalid` dit au lecteur d'écran que le champ est en erreur.
- **L71** `function verifierChamp(champ) {` — vérifie UN champ (`<input>` ou `<select>`), affiche ou efface son erreur, et renvoie `true` s'il est valide.
- **L72** `` const zoneErreur = document.querySelector(`#erreur-${champ.id}`); `` — gabarit de chaîne (accents graves) : `${champ.id}` est remplacé par l'`id` du champ, donc `#erreur-nom` ou `#erreur-r-nom`, les `<span class="champ__erreur">` du HTML. Ça repose sur une convention de nommage ; `null` si la zone n'existe pas.
- **L73** `const etat = champ.validity;` — l'objet `ValidityState` du champ : des booléens (`valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `badInput`, `customError`…) et `valid`, vrai quand aucun drapeau n'est levé. Le navigateur le tient à jour à chaque saisie, même avec `noValidate`.
- **L74** `let message = "";` — `let` car réaffecté plus bas ; la chaîne vide veut dire « pas d'erreur ».
- **L76** `if (!etat.valid) {` — on ne cherche un message que si le champ est invalide.
- **L77** `const messagesDuChamp = messages[champ.name] || {};` — notation entre crochets, car la clé est dans une variable. Si le champ n'a pas d'entrée, `messages[...]` vaut `undefined` et `|| {}` donne un objet vide : la ligne suivante ne plante pas.
- **L78** `const cle = Object.keys(messagesDuChamp).find((nom) => etat[nom]);` — `Object.keys` renvoie le tableau des clés propres, dans l'ordre d'écriture (`["valueMissing", "typeMismatch"]` pour le courriel) ; `find` renvoie la première clé dont le drapeau vaut `true` dans `etat`, ou `undefined`. L'ordre d'écriture fixe donc la priorité. Ici `nom` est juste le paramètre de la fonction fléchée (un nom de drapeau), pas le champ « nom ».
- **L79** `message = cle ? messagesDuChamp[cle] : champ.validationMessage;` — ternaire : mon message s'il existe, sinon `validationMessage`, le message du navigateur, dans la langue du navigateur.
- **L80** `}` — ferme le `if`.
- **L82** `champ.setAttribute("aria-invalid", String(!etat.valid));` — `"true"` si le champ est invalide, `"false"` sinon ; toujours une chaîne, comme `aria-expanded`.
- **L83** `if (zoneErreur) {` — garde, au cas où la zone manque.
- **L84** `zoneErreur.textContent = message;` — `textContent` écrit du texte brut, rien n'est interprété comme du HTML. La zone porte `aria-live="polite"` : le lecteur d'écran annonce le message sans déplacer le focus. Une chaîne vide efface l'erreur.
- **L85** `}` — ferme le `if`.
- **L86** `return etat.valid;` — le booléen dont `toutVerifier()` se sert.
- **L87** `}` — ferme `verifierChamp`.
- **L89–90** commentaire : aider au fil de la saisie, pas punir ; l'erreur apparaît quand on quitte le champ, puis disparaît dès que la saisie devient valide.
- **L91** `function brancherValidation(formulaire) {` — branche la validation sur un formulaire et renvoie une fonction ; appelée deux fois, pour l'inscription et pour la modale.
- **L92** `const champs = [...formulaire.querySelectorAll("input, select")];` — le sélecteur `"input, select"` prend les deux sortes de champs, dans l'ordre du document (les `<button>` n'en font pas partie). `querySelectorAll` renvoie une `NodeList`, qui a `forEach` mais pas `filter` : l'opérateur de décomposition `[...]` en fait un vrai tableau, pour le `filter` de la L108.
- **L94** commentaire : le JavaScript prend le relais des bulles du navigateur, pour des messages en français.
- **L95** `formulaire.noValidate = true;` — la propriété DOM de l'attribut `novalidate` : le navigateur n'affiche plus ses bulles et ne bloque plus l'envoi, donc l'événement `submit` part même si un champ est invalide, et c'est mon code qui doit vérifier. Les contraintes, elles, continuent d'être calculées : `validity` reste utilisable.
- **L97** `champs.forEach((champ) => {` — pour chaque champ.
- **L98** `champ.addEventListener("blur", () => verifierChamp(champ));` — `blur` part quand le champ perd le focus. La fonction fléchée enveloppe l'appel pour que `verifierChamp` reçoive le champ (gardé par la fermeture) et non l'objet événement.
- **L99** `champ.addEventListener("input", () => {` — `input` part à chaque changement de valeur : chaque frappe, chaque choix dans le `<select>`, chaque clic sur la case.
- **L100** `if (champ.getAttribute("aria-invalid") === "true") {` — on ne revérifie pendant la frappe que si l'erreur est déjà affichée : pas de message avant d'avoir fini de taper. L'état « en erreur » est relu dans le DOM.
- **L101** `verifierChamp(champ);` — l'erreur se met à jour, et disparaît dès que la saisie est valide.
- **L102–104** ferment le `if`, l'écouteur `input`, puis le `forEach`.
- **L106** commentaire : la fonction renvoyée dit vrai si tout est valide, sinon elle place le focus sur le premier champ fautif.
- **L107** `return function toutVerifier() {` — renvoie une expression de fonction nommée. C'est une fermeture : elle garde l'accès à `champs` après la fin de `brancherValidation`.
- **L108** `const invalides = champs.filter((champ) => !verifierChamp(champ));` — appelle `verifierChamp` sur TOUS les champs (toutes les erreurs s'affichent d'un coup, pas seulement la première) et ne garde que les invalides. L'effet de bord dans `filter` est voulu.
- **L109** `if (invalides.length > 0) {` — au moins un champ fautif.
- **L110** `invalides[0].focus();` — le premier dans l'ordre du document : le clavier et le lecteur d'écran arrivent directement sur l'erreur à corriger.
- **L111** `return false;` — l'appelant n'envoie pas.
- **L112** `}` — ferme le `if`.
- **L113** `return true;` — tout est valide.
- **L114–115** `};` ferme l'expression de fonction (le point-virgule termine le `return`), `}` ferme `brancherValidation`.
- **L117** `function effacerErreurs(formulaire) {` — remet un formulaire à zéro côté erreurs ; `reset()` ne touche ni à `aria-invalid` ni aux zones d'erreur.
- **L118** `formulaire.querySelectorAll("[aria-invalid]").forEach((champ) => champ.removeAttribute("aria-invalid"));` — le sélecteur d'attribut `[aria-invalid]` prend tout élément qui porte l'attribut, quelle que soit sa valeur ; on le retire plutôt que de le mettre à `"false"`, pour revenir à l'état d'un champ jamais vérifié. Ici le `forEach` de la `NodeList` suffit.
- **L119** `formulaire.querySelectorAll(".champ__erreur").forEach((zone) => (zone.textContent = ""));` — vide chaque zone d'erreur. Les parenthèses autour de l'affectation montrent qu'elle est voulue : sans accolades, la fonction fléchée renvoie la valeur de son expression, et `forEach` l'ignore.
- **L120** `}` — ferme `effacerErreurs`.

**Ce que FM03 change.** `src/ts/validation.ts` appelle d'abord `checkValidity()`, puis applique par `setCustomValidity` deux règles que le navigateur ne vérifie pas : un nom fait seulement d'espaces, une adresse sans domaine pointé. Les écouteurs `focusout` et `input` sont posés une fois sur le formulaire, un `Set` retient les champs en erreur au lieu de relire `aria-invalid`, et des `Map` remplacent les objets pour les règles et les messages (un objet hérite de clés comme `constructor`).

## Envoi en cours et délai simulé (L122–135)

- **L122–123** commentaire : le bouton passe à « … en cours » et se désactive, ce qui évite le double envoi et montre que la demande est prise (heuristique 1 de Nielsen, la visibilité de l'état du système).
- **L124** `function envoiEnCours(bouton, enCours, libelleEnCours) {` — `enCours` est un booléen ; `libelleEnCours` ne sert qu'à l'entrée en envoi, et vaut `undefined` quand on l'omet à la sortie.
- **L125** `if (enCours) {` — début de l'envoi.
- **L126** `bouton.dataset.libelle = bouton.textContent;` — `dataset` donne accès aux attributs `data-*` : cette ligne écrit `data-libelle="Créer mon compte"` sur le bouton. Le libellé d'origine est mis de côté dans le DOM, pour le rétablir ensuite.
- **L127** `bouton.textContent = libelleEnCours;` — affiche « Création en cours… » ou « Réservation en cours… ».
- **L128** `} else if (bouton.dataset.libelle) {` — fin de l'envoi, et seulement si un libellé a été mis de côté. À la première ouverture de la modale (L201), aucun envoi n'a encore eu lieu, `dataset.libelle` vaut `undefined`, et sans ce test le libellé serait effacé.
- **L129** `bouton.textContent = bouton.dataset.libelle;` — remet le libellé d'origine.
- **L130** `}` — ferme le `if`.
- **L131** `bouton.disabled = enCours;` — `true` pendant l'envoi : un bouton désactivé ne réagit plus au clic, sort de l'ordre de tabulation, et la touche Entrée dans un champ ne soumet plus le formulaire quand son bouton par défaut est désactivé. Le test `bouton.disabled` des gestionnaires `submit` (L149, L229) double cette protection.
- **L132** `}` — ferme `envoiEnCours`.
- **L134** commentaire : pas de back-end dans ce projet, on simule le délai de réponse du serveur.
- **L135** `const DELAI_SIMULE = 800;` — 800 millisecondes ; les majuscules signalent, par convention, une constante de réglage.

**Ce que FM03 change.** `src/ts/envoi.ts` remplace `envoiEnCours()` par `envoyer()`, une fonction `async` dont le bloc `finally` rétablit le bouton quoi qu'il arrive : le libellé est gardé dans une variable au lieu de `dataset.libelle`, et le focus est rendu au bouton. Le délai passe dans `src/ts/serveur-simule.ts`, un faux serveur à base de promesses qui peut refuser une inscription (« déjà inscrit »).

## Formulaire « Créer mon compte » (L137–164)

- **L137** commentaire de section (formulaire « Créer mon compte »).
- **L138** `const formInscription = document.querySelector("#form-inscription");` — le `<form id="form-inscription" action="#inscription" method="post">`.
- **L140** `if (formInscription) {` — garde : sans formulaire, le bloc ne s'exécute pas.
- **L141** `const toutVerifier = brancherValidation(formInscription);` — pose les écouteurs `blur`/`input` et `noValidate`, et récupère la fonction de vérification. `const` dans un bloc `if` a une portée de bloc : la modale peut déclarer son propre `toutVerifier` (L183) sans conflit.
- **L142** `const bouton = formInscription.querySelector("button[type=submit]");` — sélecteur d'attribut : le bouton « Créer mon compte ». Les guillemets autour de `submit` sont facultatifs, c'est un identifiant simple.
- **L143** `const confirmation = formInscription.querySelector(".formulaire__confirmation");` — le `<p role="status" hidden>` où s'écrira le message de réussite.
- **L145** `formInscription.addEventListener("submit", (evenement) => {` — j'écoute `submit` sur le formulaire, pas `click` sur le bouton : l'envoi par la touche Entrée dans un champ passe aussi par là.
- **L146** `evenement.preventDefault();` — annule l'action par défaut, l'envoi en POST vers `#inscription`, qui rechargerait la page et ferait tout perdre.
- **L147** `confirmation.hidden = true;` — masque la confirmation d'un envoi précédent.
- **L149** `if (bouton.disabled || !toutVerifier()) {` — `||` court-circuite : si un envoi est déjà en cours, `toutVerifier()` n'est même pas appelé. Sinon tout est vérifié, les erreurs s'affichent et le focus va au premier champ fautif.
- **L150** `return;` — on s'arrête là, rien n'est envoyé.
- **L151** `}` — ferme le `if`.
- **L153** `envoiEnCours(bouton, true, "Création en cours…");` — bouton désactivé, libellé « Création en cours… ».
- **L155** `setTimeout(() => {` — programme la fonction fléchée pour dans `DELAI_SIMULE` millisecondes et rend la main tout de suite : le gestionnaire `submit` se termine avant la « réponse ». C'est le délai d'un serveur, simulé.
- **L156** `const prenom = formInscription.nom.value.trim().split(" ")[0];` — `formInscription.nom` : un formulaire expose ses champs comme propriétés, par leur `name` ou leur `id`. Ces champs nommés **masquent** même les propriétés natives du formulaire : un champ `name="submit"` ou `name="action"` remplacerait `form.submit` ou `form.action` — une raison de plus pour passer par `FormData` (TP 2), d'autant que TypeScript type cet accès par nom en `any`. `trim()` retire les espaces au début et à la fin, `split(" ")` découpe aux espaces, `[0]` garde le premier mot : « Sarah Benali » donne « Sarah ».
- **L157** `` confirmation.textContent = `Merci ${prenom}, votre compte est prêt. Choisissez maintenant un atelier ci-dessus et touchez « Réserver ».`; `` — gabarit de chaîne qui insère le prénom. `textContent` et non `innerHTML` : ce que la personne a tapé reste du texte, jamais du HTML interprété.
- **L158** `confirmation.hidden = false;` — affiche le message ; la zone `role="status"` le fait annoncer par le lecteur d'écran sans déplacer le focus.
- **L159** `formInscription.reset();` — remet chaque champ à sa valeur initiale : champs vides, `<select>` sur « Choisissez », case décochée.
- **L160** `effacerErreurs(formInscription);` — `reset()` ne touche pas à `aria-invalid` ni aux zones d'erreur : on les nettoie.
- **L161** `envoiEnCours(bouton, false);` — rétablit le libellé et réactive le bouton ; le troisième argument est omis.
- **L162** `}, DELAI_SIMULE);` — ferme la fonction fléchée ; le second argument de `setTimeout` est le délai.
- **L163–164** ferment l'écouteur `submit`, puis le `if (formInscription)`.

**Ce que FM03 change.** `src/ts/inscription.ts` affiche « Inscription en cours… », lit les valeurs par `FormData` au lieu des propriétés du formulaire, et montre un refus du serveur simulé dans une zone `role="alert"`.

## Lien « formateur » (L166–175)

- **L166–167** commentaire de section : quand on arrive par le lien de l'appel aux formateurs, le profil est déjà choisi ; c'est un choix de moins pour la formatrice.
- **L168** `document.querySelectorAll("a[data-profil]").forEach((lien) => {` — tous les liens qui portent `data-profil` ; dans la page il n'y en a qu'un, « Créez votre compte », dans la section `#formateurs`. Un écouteur est posé par lien.
- **L169** `lien.addEventListener("click", () => {` — au clic sur le lien.
- **L170** `const profil = document.querySelector("#profil");` — le `<select id="profil">` du formulaire d'inscription, cherché au moment du clic.
- **L171** `if (profil) {` — garde.
- **L172** `profil.value = lien.dataset.profil;` — `dataset.profil` lit `data-profil="formateur"` ; affecter `value` à un `<select>` sélectionne l'option qui a cette valeur, ici « Formateur indépendant ». Le comportement du lien n'est pas annulé : la page saute ensuite à `#inscription`.
- **L173–175** ferment le `if`, l'écouteur de clic, puis le `forEach`.

**Ce que FM03 change.** Dans `src/ts/main.ts`, un seul écouteur délégué sur la section `#formateurs` (`closest("a[data-profil]")`) remplace l'écouteur posé sur chaque lien.

## Modale de réservation (L177–260)

- **L177** commentaire de section (« Modale de réservation »).
- **L178** `const modale = document.querySelector("#modale-reservation");` — le `<dialog id="modale-reservation">`, placé en fin de `<body>`, fermé par défaut.
- **L179** `const formReservation = document.querySelector("#form-reservation");` — le formulaire de la modale, en `method="dialog"`.
- **L180** `let declencheur = null;` — le bouton qui a ouvert la modale, pour lui rendre le focus à la fermeture. `let` car il change à chaque ouverture ; `null` tant qu'aucune n'a eu lieu.
- **L182** `if (modale && formReservation && typeof modale.showModal === "function") {` — gardes, plus une détection de fonctionnalité : `typeof` renvoie `"function"` seulement si le navigateur connaît `showModal()`. Sinon le bloc entier est sauté et les liens « Réserver » restent des liens vers le formulaire d'inscription.
- **L183** `const toutVerifier = brancherValidation(formReservation);` — la même validation, branchée sur les deux champs de la modale.
- **L184** `const titreAtelier = modale.querySelector(".modale__atelier");` — le `<span>` du titre « Réserver : … ».
- **L185** `const recap = modale.querySelector(".modale__recap");` — le paragraphe de récapitulatif sous le titre.
- **L186** `const zonesSaisie = formReservation.querySelectorAll(".champ, .modale__actions");` — les deux paragraphes `.champ` et celui des boutons « Confirmer » / « Annuler », à masquer après la réservation. La `NodeList` suffit : seul `forEach` sert.
- **L187** `const boutonReserver = formReservation.querySelector("button[value=reserver]");` — « Confirmer la réservation », reconnu par sa `value`.
- **L188** `const confirmation = formReservation.querySelector(".formulaire__confirmation");` — le `<p role="status" hidden>` de la modale ; même nom que celui de l'inscription, mais portée de bloc différente.
- **L189** `const fin = formReservation.querySelector(".modale__fin");` — le paragraphe masqué qui contient le bouton « Fermer ».
- **L191** `function ouvrirModale(atelier) {` — `atelier` est l'`<article class="atelier">` de la carte choisie.
- **L192** commentaire : l'atelier choisi est repris dans la modale, on n'a pas à s'en souvenir (heuristique 6 de Nielsen, reconnaître plutôt que se rappeler).
- **L193** `titreAtelier.textContent = atelier.querySelector("h3").textContent;` — recopie le titre de la carte, par exemple « Initiation à Git ».
- **L194** `` recap.textContent = `${atelier.querySelector(".atelier__infos").textContent} · ${atelier.querySelector(".atelier__prix").textContent}`; `` — gabarit de chaîne : les infos de la carte (le texte du `<time>` compris), un point médian, le prix. Par exemple « Niveau débutant · 3 h · en ligne · mercredi 7 octobre, 18 h 30 · 25 € ».
- **L196** `formReservation.reset();` — vide les champs d'une réservation précédente.
- **L197** `effacerErreurs(formReservation);` — et ses erreurs.
- **L198** `zonesSaisie.forEach((zone) => (zone.hidden = false));` — réaffiche les champs et les boutons, masqués si une réservation a déjà réussi (L237).
- **L199** `confirmation.hidden = true;` — masque l'ancienne confirmation.
- **L200** `fin.hidden = true;` — masque le bouton « Fermer ».
- **L201** `envoiEnCours(boutonReserver, false);` — après une réservation réussie, le code des L235–242 ne rétablit pas le bouton (il est caché) : il reste désactivé, sur « Réservation en cours… ». C'est ici qu'il redevient lui-même. À la toute première ouverture, il n'y a pas de `data-libelle` et seul `disabled = false` s'applique.
- **L203–204** commentaire : `showModal()` et non `show()`, parce que le focus entre dans la modale, qu'Échap ferme et que le reste de la page devient inerte, sans code.
- **L205** `modale.showModal();` — ouvre le `<dialog>` en modale : il passe au-dessus de tout (la « couche supérieure »), le pseudo-élément `::backdrop` assombrit le fond, le reste de la page devient inerte (ni clic ni focus possibles), le focus entre dans la modale et Échap la ferme. `show()` l'ouvrirait sans rien de tout cela, comme un simple bloc non modal.
- **L206** `}` — ferme `ouvrirModale`.
- **L208–209** commentaire : sans JavaScript, « Réserver » est un lien vers le formulaire ; avec, il devient un vrai bouton qui ouvre la modale.
- **L210** `document.querySelectorAll("a[data-reserver]").forEach((lien) => {` — les trois liens « Réserver » des cartes.
- **L211** `const bouton = document.createElement("button");` — crée un `<button>`, encore hors du document.
- **L212** `bouton.type = "button";` — le type par défaut d'un `<button>` est `submit`. Les cartes ne sont dans aucun formulaire, mais je fixe le rôle explicitement : ce bouton agit, il n'envoie rien.
- **L213** `bouton.className = lien.className;` — reprend la classe `action` : même apparence.
- **L214** `bouton.innerHTML = lien.innerHTML;` — recopie le contenu du lien sous forme de chaîne HTML, réanalysée : « Réserver » et le `<span class="visuellement-masque">` qui précise l'atelier, pour que chaque bouton garde un nom accessible unique (« Réserver l'atelier Initiation à Git »). Le contenu vient de ma page, pas d'une saisie.
- **L215** `bouton.addEventListener("click", () => {` — un écouteur par bouton.
- **L216** `declencheur = bouton;` — retient quel bouton a ouvert la modale.
- **L217** `ouvrirModale(bouton.closest(".atelier"));` — `closest` remonte du bouton jusqu'à l'`<article class="atelier">` de sa carte.
- **L218** `});` — ferme l'écouteur.
- **L219** `lien.replaceWith(bouton);` — remplace le lien par le bouton, à la même place dans le DOM. Le lecteur d'écran annonce désormais « bouton » : un lien emmène ailleurs, un bouton déclenche une action.
- **L220** `});` — ferme le `forEach`.

- **L222** `formReservation.addEventListener("submit", (evenement) => {` — les trois boutons de la modale (« Confirmer », « Annuler », « Fermer ») sont tous des `type="submit"` : tout passe par cet événement.
- **L223** `const action = evenement.submitter?.value;` — `submitter` est le bouton qui a déclenché l'envoi (avec Entrée dans un champ, c'est le bouton par défaut, le premier `submit` du formulaire : « Confirmer »). Le chaînage optionnel `?.` renvoie `undefined` au lieu de lever une `TypeError` si `submitter` est `null`. `action` vaut donc `"reserver"`, `"annuler"`, `"fermer"` ou `undefined`.
- **L224** `if (action === "annuler" || action === "fermer") {` — les deux boutons qui doivent seulement fermer.
- **L225** `return; // method="dialog" : ces deux boutons ferment la modale, sans validation` — je sors sans `preventDefault()` : l'action par défaut d'un formulaire `method="dialog"` est de fermer le `<dialog>` qui le contient (sa `returnValue` prend la `value` du bouton). Aucune vérification n'est faite, et c'est voulu : on ne bloque pas quelqu'un qui veut annuler.
- **L226** `}` — ferme le `if`.
- **L228** `evenement.preventDefault(); // retient la modale ouverte tant que ce n'est pas valide` — pour « Confirmer », j'annule la fermeture : la modale reste ouverte pendant la vérification et l'envoi.
- **L229** `if (boutonReserver.disabled || !toutVerifier()) {` — même logique que L149 : pas de second envoi, et rien sans champs valides.
- **L230** `return;` — la modale reste ouverte, le focus est sur le premier champ fautif.
- **L231** `}` — ferme le `if`.
- **L233** `envoiEnCours(boutonReserver, true, "Réservation en cours…");` — bouton désactivé, libellé « Réservation en cours… ».
- **L235** `setTimeout(() => {` — la réponse simulée arrive après `DELAI_SIMULE` millisecondes.
- **L236** `const prenom = formReservation.nom.value.trim().split(" ")[0];` — comme L156 : `formReservation.nom` trouve l'`<input name="nom" id="r-nom">` par son `name`.
- **L237** `zonesSaisie.forEach((zone) => (zone.hidden = true));` — masque les champs et les boutons « Confirmer » / « Annuler » : la réservation est faite, il n'y a plus rien à saisir.
- **L238** `` confirmation.textContent = `C'est réservé, ${prenom} ! ${titreAtelier.textContent} : ${recap.textContent}. Le lien de l'atelier arrivera à ${formReservation.courriel.value.trim()} la veille.`; `` — le message de réussite reprend le prénom, l'atelier, le récapitulatif et l'adresse saisie (sans espaces autour). En `textContent`, donc sans interprétation HTML.
- **L239** `confirmation.hidden = false;` — l'affiche ; `role="status"` le fait annoncer.
- **L240** `fin.hidden = false;` — affiche le bouton « Fermer ».
- **L241** `fin.querySelector("button").focus(); // le focus ne reste pas sur un bouton devenu caché` — le focus était sur « Confirmer », qui vient d'être masqué : il serait perdu. Je le pose sur « Fermer », la seule action qui reste.
- **L242** `}, DELAI_SIMULE);` — ferme la fonction fléchée ; le délai en second argument.
- **L243** `});` — ferme l'écouteur `submit`.
- **L245–246** commentaire : la seule chose que `<dialog>` ne garantit pas partout, c'est de rendre le focus au déclencheur ; l'événement `close` part quelle que soit la façon de fermer (bouton, Échap, fond).
- **L247** `modale.addEventListener("close", () => {` — `close` est envoyé une fois le `<dialog>` fermé, que ce soit par un bouton du formulaire `method="dialog"`, par Échap ou par `modale.close()` : un seul endroit pour tous les cas.
- **L248** `if (declencheur) {` — garde : `null` si la modale n'a jamais été ouverte par un bouton.
- **L249** `declencheur.focus();` — le focus revient sur le bouton « Réserver » de la carte d'où l'on venait : au clavier, on reprend là où on était.
- **L250–251** ferment le `if` et l'écouteur `close`.
- **L253–254** commentaire : un clic sur le fond sombre ferme, car la cible est alors le `<dialog>` lui-même ; tout le contenu est dans `.modale__contenu` et le dialog n'a pas de marge interne.
- **L255** `modale.addEventListener("click", (evenement) => {` — un écouteur de clic sur le `<dialog>`.
- **L256** `if (evenement.target === modale) {` — un clic sur `::backdrop` est reçu par le `<dialog>` lui-même, qui en est alors la cible. Le CSS donne `padding: 0` au dialog et met tout le contenu dans `.modale__contenu` : un clic à l'intérieur de la boîte a toujours pour cible un descendant (la `<div>`, un champ, un libellé). `target === modale` veut donc dire « clic sur le fond ».
- **L257** `modale.close();` — ferme la modale, ce qui déclenche `close`, donc le retour du focus.
- **L258–260** ferment le `if`, l'écouteur de clic, puis le `if` de la L182.

**Ce que FM03 change.** Au TP 1 (puis en TypeScript au TP 2), la modale range son état dans des variables (l'atelier choisi, le déclencheur, l'envoi en cours), transforme les liens en boutons en DÉPLAÇANT leurs nœuds enfants (`bouton.append(...lien.childNodes)`) au lieu de recopier `innerHTML`, et un seul écouteur de clic délégué sur la liste remplace celui de chaque bouton. Au TP 3, les cartes sont construites par `carteAtelier()` à partir du JSON : `src/ts/modale.ts` reçoit un objet `Atelier` et affiche toute la fiche (formateur, prérequis, places) au lieu de relire la carte dans le DOM ; c'est le catalogue, qui a pu reconstruire ses cartes, qui rend le focus à la bonne, retrouvée par son identifiant.

## Filtre des ateliers (L262–293)

- **L262–263** commentaire de section : le filtre est demandé par les deux personas, Jonny travaille en journée, Mélanie consulte le soir.
- **L264** `const filtres = document.querySelector(".filtres");` — la `<div class="filtres" hidden>` : deux cases à cocher et la zone de résultat, masquées dans le HTML car inutiles sans JavaScript.
- **L266** `if (filtres) {` — garde.
- **L267** `const cartes = [...document.querySelectorAll(".ateliers > li")];` — le combinateur `>` ne prend que les `<li>` enfants directs de la liste `.ateliers`. Le tableau n'est pas indispensable ici : seul `forEach` sert, et la `NodeList` l'a aussi.
- **L268** `const resultat = filtres.querySelector(".filtres__resultat");` — le `<p role="status">` qui dira combien d'ateliers restent.
- **L269** `const vide = document.querySelector(".ateliers__vide");` — le message « Aucun atelier ne correspond… », masqué au départ.
- **L271** `function filtrer() {` — recalcule tout l'affichage à partir des cases.
- **L272** `const soir = filtres.querySelector("[name=soir]").checked;` — `checked` est le booléen de la case « Le soir » ; l'état est relu dans le DOM à chaque appel.
- **L273** `const debutant = filtres.querySelector("[name=debutant]").checked;` — idem pour « Ouverts aux débutants ».
- **L274** `let visibles = 0;` — compteur, d'où `let`.
- **L276** `cartes.forEach((carte) => {` — pour chaque `<li>`.
- **L277** `const atelier = carte.querySelector(".atelier");` — l'`<article>` qui porte `data-moment` et `data-niveau`.
- **L278** `const garde =` — le résultat de l'expression sur deux lignes qui suit, un booléen.
- **L279** `(!soir || atelier.dataset.moment === "soir") &&` — si la case « soir » n'est pas cochée, `!soir` vaut `true` et la condition passe pour toutes les cartes ; sinon seules celles qui ont `data-moment="soir"` passent.
- **L280** `(!debutant || atelier.dataset.niveau !== "intermediaire");` — même logique : « ouvert aux débutants » veut dire tout sauf `intermediaire`, donc `debutant` et `tous`. Les deux conditions doivent être vraies (`&&`).
- **L281** `carte.hidden = !garde;` — l'attribut `hidden` masque le `<li>` et le retire de l'arbre d'accessibilité.
- **L282** `if (garde) visibles += 1;` — un `if` sans accolades : une seule instruction.
- **L283** `});` — ferme le `forEach`.
- **L285** commentaire : `role="status"`, le nombre de résultats est annoncé sans déplacer le focus.
- **L286** `` resultat.textContent = visibles > 1 ? `${visibles} ateliers affichés` : `${visibles} atelier affiché`; `` — ternaire pour l'accord : pluriel au-delà de 1, singulier pour 0 et 1, comme le veut le français.
- **L287** `vide.hidden = visibles > 0;` — le message « aucun atelier » n'apparaît que si le compteur vaut 0.
- **L288** `}` — ferme `filtrer`.
- **L290** `filtres.hidden = false;` — le JavaScript est là, les filtres peuvent servir : on les montre.
- **L291** `filtres.addEventListener("change", filtrer);` — `change` remonte des cases jusqu'à la `<div>` : un seul écouteur pour les deux (délégation). Je passe la fonction elle-même, sans parenthèses ; elle reçoit l'événement en argument et l'ignore.
- **L292** `filtrer();` — premier calcul : écrit « 3 ateliers affichés » et tient compte de cases que le navigateur aurait gardées cochées après un rechargement.
- **L293** `}` — ferme le `if (filtres)`.

**Ce que FM03 change.** Au TP 1, le filtre devient un composant : l'état `{ soir, debutant }` vit dans une variable, `rendre()` écrit `.checked` à partir de l'état au lieu de le relire, et `appliquerRaccourci()` permet au sous-menu « Ateliers » de le régler. Au TP 3, il est remplacé par le catalogue (`src/ts/catalogue.ts`) : recherche, niveau, tri par prix et « le soir », un état unique, un `majEtat()` et ses quatre écrans ; `src/ts/filtre.ts` ne garde que la logique pure (filtrer, trier, décrire le résultat), testée sous Node.

## Navigation courante, aria-current (L295–323)

- **L295–297** commentaire de section : `aria-current` marque le lien de la section visible ; le lecteur d'écran l'annonce, et le style (gras et souligné dans le CSS) ne repose pas sur la couleur seule.
- **L298** `const liensSections = [...document.querySelectorAll('.navigation__liste a[href^="#"]')];` — `^=` veut dire « commence par » : les liens de la navigation qui visent une ancre de la page (`#valeurs`, `#ateliers`, `#formateurs`, `#inscription`). Guillemets simples autour du sélecteur parce qu'il contient des guillemets doubles. Le tableau est une habitude : `length` et `forEach` existent aussi sur la `NodeList`.
- **L300** `if (liensSections.length && "IntersectionObserver" in window) {` — `length` vaut 0 (donc faux) s'il n'y a aucun lien ; l'opérateur `in` teste si `window` possède la propriété `IntersectionObserver` : détection de fonctionnalité, sans elle le bloc est sauté.
- **L301** `const observateur = new IntersectionObserver(` — crée un observateur qui prévient quand un élément entre dans une zone de l'écran ou en sort ; il prend une fonction de rappel et des options.
- **L302** `(entrees) => {` — la fonction de rappel reçoit un tableau d'`IntersectionObserverEntry`, une par section dont l'état d'intersection vient de changer.
- **L303** `entrees` — début d'une chaîne de méthodes écrite sur plusieurs lignes.
- **L304** `.filter((entree) => entree.isIntersecting)` — ne garde que les sections qui entrent dans la zone. Quand une section en sort, rien ne change : son lien reste marqué jusqu'à ce qu'une autre entre. En remontant tout en haut, sur l'accroche qui n'a pas de lien dans la liste, « Valeurs » reste donc marqué.
- **L305** `.forEach((entree) => {` — pour chaque section entrée.
- **L306** `liensSections.forEach((lien) => {` — je repasse sur tous les liens.
- **L307** `` if (lien.getAttribute("href") === `#${entree.target.id}`) { `` — `entree.target` est la section observée. `getAttribute("href")` renvoie la valeur écrite dans le HTML, `"#valeurs"`, alors que la propriété `lien.href` renverrait l'URL absolue ; je compare au `#` suivi de l'`id`.
- **L308** `lien.setAttribute("aria-current", "true");` — marque le lien de la section courante. `"true"` est la valeur générique (« l'élément courant d'un ensemble ») ; la formule exacte annoncée dépend du lecteur d'écran.
- **L309** `} else {` — pour tous les autres liens.
- **L310** `lien.removeAttribute("aria-current");` — je retire l'attribut plutôt que de le mettre à `"false"` : le sélecteur CSS `a[aria-current]` teste sa seule présence.
- **L311–313** ferment le `if`/`else`, le `forEach` des liens, puis celui des entrées.
- **L314** `},` — fin de la fonction de rappel, premier argument du constructeur.
- **L315** commentaire : une section est « courante » quand elle traverse le milieu de l'écran.
- **L316** `{ rootMargin: "-45% 0px -50% 0px" }` — les options, second argument. Sans `root`, la zone de référence est la fenêtre ; `rootMargin` la rétrécit, dans l'ordre haut, droite, bas, gauche : −45 % en haut, −50 % en bas. Il reste une bande fine, de 45 % à 50 % de la hauteur, juste au-dessus du milieu de l'écran. Le seuil par défaut est 0 : le rappel part dès qu'un pixel de la section entre dans la bande ou en sort.
- **L317** `);` — ferme l'appel du constructeur.
- **L319** `liensSections.forEach((lien) => {` — pour chaque lien, je cherche sa section.
- **L320** `const section = document.querySelector(lien.getAttribute("href"));` — l'`href` `"#valeurs"` sert directement de sélecteur CSS d'`id`. Ça marche avec les liens de la page, mais un lien `href="#"` donnerait `querySelector("#")`, sélecteur invalide qui lève une erreur.
- **L321** `if (section) observateur.observe(section);` — commence l'observation. À l'appel d'`observe()`, le rappel reçoit une première entrée pour la section : le lien courant est donc marqué dès le chargement, sans attendre un défilement.
- **L322–323** ferment le `forEach`, puis le `if` de la L300.

**Ce que FM03 change.** `src/ts/navigation-courante.ts` ne prend que les liens de premier niveau, car les raccourcis du sous-menu visent tous `#ateliers`. Il observe directement toutes les sections de la page, accroche comprise, et tient l'ensemble de celles qui traversent le milieu de l'écran : remonté en haut, plus aucun lien n'est marqué. Il compare leur `id` à `lien.hash`, toujours une chaîne : plus de `querySelector(href)`, qui lève une erreur sur un lien `href="#"` et arrêterait tout le module.

## Année du pied de page (L325–329)

- **L325** commentaire de section (« Année du pied de page »).
- **L326** `const annee = document.querySelector(".annee");` — le `<span class="annee">` du pied de page, où le HTML écrit déjà « 2026 » : sans JavaScript, l'année reste affichée.
- **L327** `if (annee) {` — garde.
- **L328** `annee.textContent = new Date().getFullYear();` — `new Date()` est la date et l'heure de l'ordinateur du visiteur ; `getFullYear()` en renvoie l'année, en heure locale, sous forme de NOMBRE (2026). `textContent` attend une chaîne : le nombre est converti implicitement en `"2026"`. Ça marche, mais c'est une conversion cachée, et TypeScript la signale au TP 2 (`TS2322`).
- **L329** `}` — ferme le `if`, dernière ligne du fichier.

**Ce que FM03 change.** `src/ts/main.ts` écrit `String(new Date().getFullYear())` : la conversion devient explicite.

## Ce que je dois savoir redire sans le document

- **Délégation et `closest()`.** Un écouteur sur un parent sert tous ses enfants, parce que l'événement remonte. `event.target` est l'élément exact touché (l'icône SVG, le `<span>` dans le bouton) : `closest()` remonte jusqu'au bouton ou au lien qui m'intéresse, ou rend `null`. FM02 le fait déjà pour la liste du menu et le filtre ; FM03 en fait la règle.
- **Garder l'état dans une variable, pas dans le DOM.** FM02 relit l'état dans la page : `aria-expanded` (`menuOuvert()`), `aria-invalid`, `.checked`, `dataset.libelle`. FM03 garde l'état dans des variables et une fonction `rendre()` écrit le DOM : l'écran suit l'état, jamais l'inverse.
- **`aria-expanded` est une chaîne.** On écrit `String(booleen)` et on compare avec `=== "true"`, parce que `"false"` est une chaîne non vide, donc vraie dans un `if`. Même chose pour `aria-invalid`.
- **`defer`.** Le script est téléchargé pendant l'analyse du HTML et exécuté après, avant `DOMContentLoaded` : les éléments existent déjà quand `querySelector` les cherche. `type="module"`, en FM03, implique `defer`.
- **`showModal()` et `<dialog>`.** `showModal()` et non `show()` : couche supérieure, `::backdrop`, page inerte, focus dans la modale, Échap qui ferme. `method="dialog"` : soumettre le formulaire ferme la modale. L'événement `close` part quelle que soit la façon de fermer ; un clic dont la cible est le `<dialog>` lui-même vient du fond.
- **`validity` et `noValidate`.** `champ.validity` est un `ValidityState` : des drapeaux booléens (`valueMissing`, `typeMismatch`…) et `valid`. `noValidate = true` coupe les bulles du navigateur et le blocage de l'envoi, pas le calcul des contraintes. `Object.keys(...).find(...)` choisit le premier message dont le drapeau est levé, sinon `validationMessage`.
- **`preventDefault()`.** Il annule l'action par défaut : le rechargement de la page pour l'inscription, la fermeture de la modale pour « Confirmer ». Pour « Annuler » et « Fermer », je ne l'appelle pas, et la modale se ferme.
- **Gestion du focus, quatre cas.** Échap dans le menu : le focus revient au bouton Menu. Fermeture de la modale : il revient au `declencheur`, le bouton « Réserver » d'origine. Envoi invalide : il va au premier champ fautif. Bouton masqué après la réservation : il passe sur « Fermer ».
- **`textContent` plutôt qu'`innerHTML`.** Tout ce qui contient une saisie (le prénom, l'adresse) s'écrit en `textContent`, donc jamais interprété comme du HTML. Le seul `innerHTML` (L214) recopie mon propre HTML, et FM03 le remplace en déplaçant les nœuds.
- **Amélioration progressive et gardes.** Chaque bloc vérifie que ses éléments existent (`if (element)`) et que le navigateur sait faire (`typeof modale.showModal === "function"`, `"IntersectionObserver" in window`). Sans JavaScript, ou sans ces fonctionnalités, la page reste complète.
