# FM03 · TP 1 — réécrire le comportement de FM02, en le comprenant

> Consigne (diapo 25) : annoter le code FM02 ; réécrire le menu en **délégation**, qui doit marcher pour un menu à sous-menus ; sortir l'**état** de l'interface du DOM ; valider au fil de la saisie ; à l'envoi, empêcher le rechargement, désactiver le bouton, « Inscription en cours… », puis le résultat ; refaire le parcours **au clavier seul** et expliquer la gestion du focus sans regarder le code.
> Critère : C04, interactions côté client en JavaScript.

Le TP 1 a été écrit en **JavaScript, à la main**, en modules ES (commit « TP 1 (FM03) », `src/js/*.js`). Depuis le TP 2, ces mêmes modules vivent en TypeScript dans `src/ts/`, et `src/js/` contient le JavaScript compilé. Les chemins ci-dessous sont ceux d'aujourd'hui.

## 1. Le code de FM02, annoté

[`fm03-tp1-code-fm02-annote.md`](fm03-tp1-code-fm02-annote.md) : les 329 lignes du `skillhub.js` de FM02, annotées ligne par ligne, avec pour chaque bloc ce que FM03 en a fait.

## 2. Un seul point d'entrée, un fichier par responsabilité

La page ne charge plus qu'un script : `<script type="module" src="js/main.js">`. `type="module"` implique `defer` et donne à chaque fichier sa propre portée. « Un seul fichier massif » est une erreur listée par la fiche EC02. `main` monte chaque composant dans `monter()` : si l'un plante, la console dit lequel, et les autres marchent encore.

| Module | Rôle |
|---|---|
| [`menu.ts`](../src/ts/menu.ts) | menu mobile et sous-menu, en délégation |
| [`validation.ts`](../src/ts/validation.ts) | validation au fil de la saisie |
| [`envoi.ts`](../src/ts/envoi.ts) | « … en cours », puis le résultat |
| [`serveur-simule.ts`](../src/ts/serveur-simule.ts) | le serveur absent : délai et refus |
| [`inscription.ts`](../src/ts/inscription.ts) | « Créer mon compte » |
| [`modale.ts`](../src/ts/modale.ts) | la fiche et la réservation |
| [`navigation-courante.ts`](../src/ts/navigation-courante.ts) | `aria-current` sur la section visible |

Sans le module (page ouverte en `file://`, réseau coupé), le petit script du `<head>` retire la classe `js` : le menu reste déplié et la page complète. Testé.

## 3. Le menu en délégation, avec un sous-menu

Dans la navigation, « Ateliers » reste un **lien**. À côté, un **bouton** ouvre trois raccourcis : *Tout le catalogue*, *Pour débutants*, *Le soir*. C'est le motif « disclosure » de l'APG, pas un `role="menu"`, qui imposerait la navigation aux flèches d'une application. Sans JavaScript, le bouton et le sous-menu n'apparaissent pas : ils n'ont de sens qu'avec le filtre.

**Un seul écouteur de clic, sur la `<nav>`** :

```ts
nav.addEventListener("click", (evenement) => {
  const cible = elementCible(evenement);
  const bouton = cible?.closest("button[aria-controls]"); // l'icône dans le bouton remonte au bouton
  if (bouton === boutonMenu) { majEtat({ menuOuvert: !etat.menuOuvert, sousMenuOuvert: null }); return; }
  const sousMenu = sousMenus.find((s) => s.bouton === bouton);
  if (sousMenu) { majEtat({ sousMenuOuvert: etat.sousMenuOuvert === sousMenu.id ? null : sousMenu.id }); return; }
  const lien = cible?.closest("a");
  if (lien) { /* raccourci transmis par un rappel, puis */ toutFermer(); }
});
```

Un second sous-menu demain : un bouton `.navigation__deplier` et son panneau dans le HTML, et c'est tout. Le code ne change pas. La preuve est relevée par le protocole des outils de développement (onglet « Écouteurs d'événements ») : la `<nav>` porte **un** écouteur `click`, ses boutons **aucun** (test `menu.test.js`).

**Ce que je retire aussi, et pourquoi.** Échap et le clic dehors s'écoutent sur `document`, mais seulement tant qu'un panneau est ouvert : ces écouteurs sont posés avec le `signal` d'un `AbortController` et retirés **ensemble**, d'un seul `abort()`, à la fermeture (cours, 2.4). Menu fermé, le document n'a aucun écouteur du menu (testé).

Le menu ne connaît pas le catalogue. Il prévient (`surRaccourci`), et `main.ts` décide quoi en faire : c'est la « frontière explicite » du cours (4.1).

## 4. L'état sorti du DOM

FM02 demandait au DOM ce qui était ouvert : `menuOuvert()` relisait `aria-expanded`. Désormais :

```ts
let etat: EtatMenu = { menuOuvert: false, sousMenuOuvert: null };   // ce qui est ouvert, à UN endroit

function rendre(): void {               // LA fonction qui écrit aria-expanded et data-ferme
  boutonMenu.setAttribute("aria-expanded", String(etat.menuOuvert));
  liste.toggleAttribute("data-ferme", !etat.menuOuvert);
  /* idem pour chaque sous-menu */
}

function majEtat(changement: Partial<EtatMenu>): void {   // le seul point d'entrée
  etat = { ...etat, ...changement };   // un NOUVEL objet
  rendre();
  suivreLeDocument(etat.menuOuvert || etat.sousMenuOuvert !== null);
}
```

Même règle partout. Le filtre FM02 avait son état `{ soir, debutant }` dans une variable et ne relisait plus `.checked` ; le catalogue du TP 3 l'a remplacé. `envoyer()` garde le libellé du bouton dans une variable, plus dans `dataset.libelle`. La validation retient les champs en erreur dans un `Set`, sans relire `aria-invalid`. La modale tient l'atelier affiché et l'envoi en cours dans des variables.

## 5. Valider au fil de la saisie

**Le navigateur d'abord, mes règles ensuite** ([`validation.ts`](../src/ts/validation.ts)) :

```ts
champ.setCustomValidity("");                 // 1. on repart de la validation native…
if (champ.checkValidity()) {                 // 2. … qui passe en premier
  champ.setCustomValidity(REGLES.get(champ.name)?.(champ.value) ?? "");   // 3. puis mes règles
}
```

Mes deux règles bouchent deux vrais trous du navigateur, vérifiés par un test qui montre que `checkValidity()` seul les accepte :

| Saisie | Le navigateur seul | Avec ma règle |
|---|---|---|
| Nom : `"   "` (trois espaces) | valide (`required` est satisfait) | « Indiquez votre prénom et votre nom. » |
| Courriel : `a@b` | valide (`type="email"`) | « L'adresse doit ressembler à nom@exemple.fr. » |

Le message va **à côté du champ**, dans la zone que le champ désigne par `aria-describedby`. La fonction retrouve la zone par cet attribut : le lien du code et le lien annoncé sont le même. `aria-invalid` suit. L'erreur apparaît quand on quitte le champ, se corrige pendant la frappe tant qu'elle est affichée, et disparaît dès que la saisie est bonne : aider, pas punir. Les écouteurs sont délégués au formulaire (`focusout`, qui remonte, et non `blur`, qui ne remonte pas).

## 6. À l'envoi

```ts
formulaire.addEventListener("submit", async (evenement) => {
  evenement.preventDefault();                 // sans lui, la page se recharge et tout est perdu
  if (enCours) return;                        // pas de double envoi
  if (!toutVerifier()) return;                // le focus va au premier champ fautif
  try {
    await envoyer(bouton, "Inscription en cours…", () => inscrire(inscription));
    confirmation.textContent = `Merci ${prenom}, votre compte est prêt…`;
  } catch (erreur) {
    alerte.textContent = erreur instanceof ErreurServeur ? erreur.message : "L'inscription n'a pas pu aboutir…";
  }
});
```

`envoyer()` désactive le bouton, affiche « Inscription en cours… », puis rend le bouton **dans un `finally`** : quoi qu'il arrive, l'indicateur ne reste pas bloqué. Un bouton désactivé n'est plus annoncé : « Inscription en cours… » est donc écrit aussi dans la zone `role="status"` du formulaire, que le résultat remplace ensuite. Dans la modale, pendant l'envoi, ni « Annuler », ni Échap, ni le fond ne ferment : la demande est partie, sa réponse doit être lue. Le relevé clavier montre qu'un bouton désactivé **perd le focus** (`Enter → body`) : `envoyer()` le lui rend, sinon le clavier repartirait du haut de la page.

Sans back-end, [`serveur-simule.ts`](../src/ts/serveur-simule.ts) tient le rôle du serveur. Il répond en 800 ms et **refuse** une adresse déjà inscrite (le 409 du cours, 5.3). Le refus s'affiche dans une zone `role="alert"`, la confirmation dans une zone `role="status"`. Ces deux zones sont dans la page dès le départ, vides, parce qu'une zone cachée puis montrée n'est pas toujours annoncée.

## 7. Le parcours au clavier seul

Rejoué par un test de bout en bout ([`clavier.test.js`](../tests/e2e/clavier.test.js)) : de vraies touches envoyées à Chrome, l'élément focalisé relevé à chaque arrêt. Téléphone (375 px) :

```
Tab    → a.evitement "Aller au contenu"
Tab    → a.logo "SkillHub"
Tab    → button.menu-bouton "Menu"
Enter  → button.menu-bouton "Menu"                       (menu ouvert)
Tab    → a "Valeurs"
Tab    → a "Ateliers"
Tab    → button.navigation__deplier "Raccourcis vers les ateliers"
Enter  → button.navigation__deplier                      (sous-menu ouvert)
Tab    → a "Tout le catalogue"
Tab    → a "Pour débutants"
Tab    → a "Le soir"
Enter  → body                    (filtre « le soir » appliqué, menu refermé, page sur les ateliers)
Tab    → input#recherche         (le point de départ du clavier a suivi l'ancre)
Tab    → select#niveau
Tab    → select#tri
Tab    → input#soir              (cochée par le raccourci)
Tab    → button "Réserver l'atelier Initiation à Git"
Enter  → input#r-nom             (la fiche s'ouvre, le focus y entre)
Tab    → input#r-courriel
Enter  → (confirmation) → button "Fermer"
Enter  → button "Réserver l'atelier Initiation à Git"   (le focus revient d'où l'on vient)
Tab    → button "Réserver l'atelier Construire son portfolio"
```

Ordinateur, formulaire d'inscription : Entrée sur le formulaire vide → message sous le nom, focus sur le nom ; je tape → le message disparaît ; Tab, courriel, profil (flèche bas), case (Espace), « Lire les conditions », « Créer mon compte », Entrée → « Inscription en cours… » → confirmation, focus rendu au bouton.

Échap, testé à part : ferme d'abord le sous-menu (focus sur son bouton), puis le menu (focus sur « Menu »). Tab qui sort d'un groupe ferme son sous-menu.

## 8. Ma gestion du focus, à dire sans le code

> 1. **Le focus ne disparaît jamais.** Chaque fois qu'un élément focalisé va disparaître, je pose le focus ailleurs AVANT : Échap dans le menu → sur le bouton qui l'a ouvert ; confirmation de la modale → le bouton « Réserver » est caché, le focus passe sur « Fermer » ; « Réessayer » disparaît → le focus va au titre du catalogue ; « Tout afficher » disparaît → le focus va au champ de recherche. Et la modale ne se ferme pas pendant un envoi : sinon la réponse arriverait dans une fenêtre fermée, et la carte reconstruite emporterait le focus.
> 2. **On revient d'où l'on vient.** La modale fermée (bouton, Échap ou clic sur le fond : l'événement `close` part dans tous les cas), le focus revient au bouton « Réserver » de la carte. Si la carte a été reconstruite entre-temps, le catalogue la retrouve par l'identifiant de l'atelier ; si l'atelier est devenu complet, son bouton est inerte, donc le focus se pose sur son titre.
> 3. **À l'erreur, au premier champ fautif.** Le formulaire refusé met le focus sur le premier champ en erreur, dont le message est lu avec lui (`aria-describedby`).
> 4. **Le navigateur fait le reste, je ne le refais pas.** `showModal()` fait entrer le focus dans la modale, le garde dedans et ferme par Échap. Un vrai `<button>` répond à Entrée et Espace. Un lien vers une ancre déplace le point de départ du clavier.
> 5. **Ce qui ne bouge pas le focus est annoncé.** Un compteur, une confirmation, un refus : ils sont lus par le lecteur d'écran sans déplacer le focus (`role="status"`, `role="alert"`).

---

*Fait avec un assistant de code : le code, les tests et ce rapport. Ce que j'ai vérifié : les 24 tests de bout en bout du TP 1 (menu, délégation relevée par le protocole DevTools, validation, envoi, modale, clavier, `file://`). **À faire moi-même avant l'oral** : rejouer ce parcours au clavier sur la page en ligne, puis expliquer le § 8 à un voisin sans regarder l'écran.*
