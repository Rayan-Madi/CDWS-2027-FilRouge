# FM03 · TP 2 — passer le script en TypeScript

> Consigne (diapo 30) : installer TypeScript en mode strict, renommer en `.ts` et **lire les erreurs sans rien corriger**, en noter trois, écrire `types.ts`, typer les sélections du DOM en traitant `null`, éliminer les `any`, vérifier que le comportement du TP 1 est **identique**.

## 1. Installation et chaîne de compilation

```bash
npm install --save-dev typescript   # 7.0.2, dans package.json
npm run build                        # tsc -p . : src/ts/*.ts → src/js/*.js (+ cartes de sources)
npm run verifier                     # tsc -p . --noEmit : vérifie sans rien écrire
```

Les sources vivent dans `src/ts/`. La page charge `src/js/main.js`, le **JavaScript produit**, et il est commité : GitHub Pages sert le dépôt tel quel, sans étape de construction. Les cartes de sources (`.js.map`) font afficher les fichiers `.ts` dans l'onglet Sources des outils de développement. L'intégration continue recompile et refuse la PR si `src/js/` n'est pas à jour.

**[`tsconfig.json`](../tsconfig.json)**, les options qui comptent :

| Option | Pourquoi |
|---|---|
| `strict` | Dès le premier jour : l'activer plus tard coûte dix fois plus (cours, 3.1) |
| `noUncheckedIndexedAccess` | `tableau[0]` ou `objet[clé]` peut être `undefined` : le compilateur oblige à le traiter |
| `exactOptionalPropertyTypes` | un champ facultatif est absent, pas « `undefined` écrit à la main » |
| `module` / `moduleResolution` `NodeNext` | un import relatif **doit** finir par `.js` : sinon le navigateur ne trouve pas le fichier, et le compilateur le refuse |
| `verbatimModuleSyntax` | un import qui ne sert qu'aux types s'écrit `import type` : il disparaît à la compilation, et ça se voit |
| `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` | du code mort ou un `switch` qui « tombe » dans le cas suivant sont des bugs en attente |
| `types: []` | du code de navigateur : pas de types Node.js mêlés au DOM |

## 2. Renommer, et lire ce que dit le compilateur

J'ai renommé les modules du TP 1 (`git mv src/js/x.js src/ts/x.ts`) puis lancé `tsc` **sans rien corriger**. Même chose sur le `skillhub.js` de FM02 (commit 3d96c47), pour voir ce que le typage aurait trouvé dans le code d'origine. La sortie brute, complète, est dans [`fm03-tp2-sortie-tsc.txt`](fm03-tp2-sortie-tsc.txt) :

| | Modules du TP 1 | `skillhub.js` de FM02 |
|---|---|---|
| Erreurs | **72** | **79** |
| `TS7006` paramètre implicitement `any` | 49 | 10 |
| `TS7005`, `TS7034`, `TS7053` autres `any` implicites | 13 | 3 |
| `TS18047` / `TS2531` « possiblement null » | 3 | 31 |
| `TS2339` propriété inexistante sur `Element` / `EventTarget` | 6 | 30 |
| Autres (`TS2322`, `TS2551`, `TS2554`, `TS2769`) | 1 | 5 |

La plupart des erreurs du TP 1 sont des paramètres non typés : c'est attendu, le JavaScript n'en a pas. Celles de FM02 sont surtout des `querySelector` qui peuvent rendre `null` ou un `Element` trop large. **Cinq de ces erreurs cachaient un vrai bug** :

### Erreur 1 — `TS7053` : `REGLES[champ.name]`, un champ nommé « constructor » toujours invalide

```
src/ts/validation.ts(56,21): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ nom: …; courriel: … }'.
```

**Ce qu'elle cachait.** `REGLES` est un objet ; `REGLES[champ.name]` trouve aussi ce qu'il **hérite** de `Object.prototype`. Vérifié sous Node avec la même expression :

| `champ.name` | ce que rend la « règle » |
|---|---|
| `nom` | `""` (valide) |
| `constructor` | **la valeur saisie elle-même**, posée comme message d'erreur : le champ est toujours invalide |
| `toString` | `"[object Undefined]"` |
| `valueOf` | **exception** : la validation plante |

Même défaut dans le filtre (`RACCOURCIS[raccourci]`, `filtre.ts(59)`), où `data-raccourci="toString"` passait le test.
**Correction :** des `Map` (`REGLES.get(champ.name)`), qui n'héritent de rien, et `Object.hasOwn` pour les raccourcis.

### Erreur 2 — `TS2769` : `querySelector(lien.getAttribute("href"))`, et le lien `href="#"`

```
skillhub.ts(320,44): error TS2769: No overload matches this call. … Argument of type 'string | null' is not assignable to parameter of type 'string'.
```

**Ce qu'elle cachait.** Le compilateur signale le `null` ; en regardant la ligne, le vrai problème est pire : un lien `href="#"` dans la navigation donne `querySelector("#")`, qui **lève** `SyntaxError: '#' is not a valid selector` (vérifié dans Chrome). Tout le bloc `aria-current` s'arrête. Dans le TP 1, la même ligne (`navigation-courante.ts(28)`) n'a **pas** été signalée : `lien` était implicitement `any`, et un `any` éteint toutes les vérifications qui suivent. C'est exactement la dette dont parle le cours.
**Correction :** `document.getElementById(lien.hash.slice(1))`, qui ne lève jamais.

### Erreur 3 — `TS2531` + `TS2339` : `donnees.get("nom").trim()`

```
src/ts/inscription.ts(24,12): error TS2531: Object is possibly 'null'.
src/ts/inscription.ts(24,31): error TS2339: Property 'trim' does not exist on type 'FormDataEntryValue'.
```

**Ce qu'elle cachait.** `FormData.get()` rend `null` si le champ n'existe pas (renommé dans le HTML), ou un `File` pour un champ de fichier. Dans les deux cas, `.trim()` lève une `TypeError` **après** `preventDefault()` : le formulaire ne fait plus rien, sans un mot pour la personne.
**Correction :** `texteDu(donnees, nom)` dans [`formulaire.ts`](../src/ts/formulaire.ts) rend toujours une chaîne. Le profil est en plus vérifié par une garde (`estProfil`), qui affiche un message si une option a été ajoutée au HTML sans passer par le type `Profil`.

### Erreur 4 — `TS18047` : `boutonMenu` « possiblement null » dans `ouvrirMenu`

```
skillhub.ts(13,3): error TS18047: 'boutonMenu' is possibly 'null'.
skillhub.ts(18,10): error TS18047: 'boutonMenu' is possibly 'null'.
```

**Ce qu'elle cachait.** Dans FM02, le garde-fou `if (boutonMenu && menu)` (ligne 21) ne protège que le bloc qui suit. Les fonctions `ouvrirMenu` et `menuOuvert`, déclarées **au-dessus**, restent appelables partout : sur une page sans bouton, le premier appel plante (« Cannot read properties of null »).
**Correction :** le menu est un composant qui reçoit sa `<nav>` en argument et trouve ses éléments par `trouver()` (§ 4). Il n'existe pas de fonction du menu appelable sans menu.

### Erreur 5 — `TS2322` : `annee.textContent = new Date().getFullYear()`

```
src/ts/main.ts(58,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

**Ce qu'elle cachait.** Ça marche par conversion implicite, mais l'instruction ment sur son type. C'est la même famille que le prix reçu « en chaîne » d'une API (cours, 3.2) : la conversion doit être écrite, pas subie.
**Correction :** `String(new Date().getFullYear())`.

**Deux autres, instructives.** `TS2339 : Property 'submitter' does not exist on type 'Event'` (FM02, ligne 223) : comme `querySelector("#form-reservation")` rendait un `Element`, l'écouteur recevait un `Event` générique. Typé `HTMLFormElement`, il reçoit un `SubmitEvent`, dont `submitter` est un `HTMLElement | null` : il faut vérifier `instanceof HTMLButtonElement` avant de lire `.value`. `TS2554 : Expected 3 arguments, but got 2` (FM02, lignes 161 et 201) : `envoiEnCours(bouton, false)` faisait deux métiers selon un booléen. Il est devenu `envoyer(bouton, libellé, action)`, une seule chose, avec `finally`.

## 3. Les types métier : [`src/ts/types.ts`](../src/ts/types.ts)

```ts
export type Niveau = "debutant" | "intermediaire" | "avance";
export interface Atelier { readonly id: string; readonly titre: string; readonly niveau: Niveau;
  readonly prix: number; readonly places: number; readonly formateur: string; /* + catégorie, description,
  prérequis, durée, lieu, date : le catalogue du TP 3 */ }
export type Profil = "apprenant" | "formateur";
export interface Inscription { readonly nom: string; readonly courriel: string; readonly profil: Profil; }
export interface Reservation { readonly atelierId: string; readonly nom: string; readonly courriel: string; }
```

`readonly` partout : on produit un nouvel objet (`{ ...atelier, places: places - 1 }`), on ne modifie jamais l'ancien (cours, 2.1).

## 4. Les sélections du DOM, et le cas `null` : [`src/ts/dom.ts`](../src/ts/dom.ts)

```ts
export function trouver<T extends Element>(racine: ParentNode, selecteur: string, Type: new () => T): T {
  const element = racine.querySelector(selecteur);
  if (!(element instanceof Type)) {
    throw new Error(`SkillHub : « ${selecteur} » est introuvable, ou n'est pas un ${Type.name}.`);
  }
  return element;
}
// trouver(formulaire, "button[type=submit]", HTMLButtonElement) : un HTMLButtonElement, garanti
```

Le cours écrit `querySelector<HTMLInputElement>("#courriel")` puis un test de `null`. `trouver` va un cran plus loin : le paramètre de type de `querySelector` **affirme** le type sans le vérifier (ce serait un `<select>`, il ne dirait rien). `instanceof`, lui, vérifie à l'exécution ce que le type promet à la compilation. Il n'y a donc aucun `as` dans le code. Un élément manquant donne une erreur qui le **nomme**. Dans `main.ts`, chaque composant démarre dans `monter()` : s'il lève, la console dit lequel, et les autres marchent encore.

Pour les éléments facultatifs de la page (la modale, le formulaire), `main.ts` teste `instanceof` et ne monte le composant que s'il est là. `event.target` (un `EventTarget`, peut-être un nœud texte) passe par `elementCible()` avant `closest()`.

## 5. Zéro `any`

[`tests/unitaires/source.test.js`](../tests/unitaires/source.test.js) lit chaque `.ts`, sans les commentaires ni les chaînes, et refuse : `any`, `as Type` (seul `as const` est permis), l'assertion de non-nullité `!`, `<Type>valeur` et `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`. Un second test vérifie que ce filet attrape bien chaque cas.

Un `any` qu'aucun test textuel ne voit : `formulaire.nom`. Le DOM type l'accès par nom d'un `HTMLFormElement` en `any` (`[name: string]: any`). Écrire `formulaire.nom.value` compilerait sans un mot. Je lis donc les formulaires par `FormData` et `texteDu()`.

## 6. Le comportement est-il identique ?

Oui, et c'est vérifié par la **même** suite de tests, sans en changer une ligne : les 24 tests de bout en bout du TP 1 (menu et sous-menu, délégation relevée par le protocole DevTools, validation, envoi, modale, filtre, parcours au clavier, `file://`) passent sur le JavaScript écrit à la main (commit du TP 1) **et** sur le JavaScript compilé depuis TypeScript (commit du TP 2). `npm test` les relance.

## 7. Ce que TypeScript n'attrapera jamais

Tout ce qui vient du dehors. `reponse.json() as Promise<Atelier[]>` ne contrôle rien : un prix reçu en chaîne passerait sans bruit. Au TP 3, la réponse est donc **vérifiée** par une garde, `estAtelier(valeur: unknown): valeur is Atelier` ([`api.ts`](../src/ts/api.ts)). Le type est une promesse, la garde est le contrôle.

---

*Fait avec un assistant de code : la conversion, les corrections et ce rapport. Les erreurs sont celles qu'a vraiment rendues `tsc` (sortie brute jointe), et les trois démonstrations (champ `constructor`, `querySelector("#")`, `FormData.get`) ont été rejouées. À refaire moi-même avant l'oral : renommer un fichier, lire une erreur `TS18047` à voix haute et dire ce qu'elle protège.*
