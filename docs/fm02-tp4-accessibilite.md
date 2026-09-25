# FM02 · TP 4 — Rapport d'analyse d'accessibilité

> Critère C1.2 de l'EC01 : ARIA, labels associés aux champs, contraste, navigation clavier. La fiche d'épreuve demande un export Wave ou Lighthouse **qui décrit les améliorations possibles** : c'est la dernière partie de ce rapport.

Page auditée : `https://rayan-madi.github.io/CDWS-2027-FilRouge/src/` · niveau visé : **WCAG 2.2 AA**.

---

## 1. Les mesures, avant et après

| Outil | Avant (page de fin de FM01) | Après (TP 4) | Rapport exporté |
|---|---|---|---|
| **Lighthouse**, onglet Accessibilité, mobile | **100** — 25 contrôles réussis, 0 échec, 10 à vérifier à la main | **100** — 29 contrôles réussis (la modale et le filtre en ajoutent), 0 échec, 10 à vérifier à la main | [`lighthouse-a11y-avant.html`](lighthouse-a11y-avant.html) · [`lighthouse-a11y-apres.html`](lighthouse-a11y-apres.html) |
| **Wave** (extension WebAIM) : erreurs / erreurs de contraste / alertes | _à compléter_ | _à compléter_ | `wave-avant.pdf` · `wave-apres.pdf` |
| **axe-core 4** (le moteur de Lighthouse), 375 et 1280 px | 0 violation, 43 contrôles réussis | 0 violation, 48 contrôles réussis, **modale ouverte comprise** | — |

Les deux rapports Lighthouse ont été produits le 25/09/2026, dans les mêmes conditions (Lighthouse en ligne de commande, mobile, serveur local) : « avant » sur la version de fin de FM01, « après » sur la version du TP 4.

**Ce que ces chiffres ne disent pas.** La page partait déjà sans erreur détectable : le HTML sémantique de FM01 fait l'essentiel du travail. Mais le cours le rappelle : aucun outil automatique ne voit plus d'un tiers des critères, et un score de 100 prouve seulement l'absence des fautes qu'une machine sait voir. **Ce TP a donc surtout changé ce que les outils ne mesurent pas** : le comportement au clavier, la modale, l'état des boutons pendant l'envoi.

---

## 2. Ce qui a changé

| Changement | Pourquoi | Critère |
|---|---|---|
| **Modale de réservation** en `<dialog>`, ouverte par `showModal()` | Le focus entre dans la modale, Échap ferme, le reste de la page devient inerte : le navigateur le fait seul | 2.1.1, 2.1.2, 4.1.2 |
| Le focus **revient au bouton « Réserver »** à la fermeture, quelle qu'elle soit (Annuler, Échap, fond, Fermer) | La seule chose que `<dialog>` ne garantit pas partout, et celle que le correcteur vérifie | 2.4.3 |
| La modale **reprend l'atelier choisi** : titre, niveau, durée, lieu, date, prix | Étape 3 du parcours de Jonny (TP 1) : ne plus avoir à s'en souvenir | Nielsen 6 |
| « Réserver » : **un lien sans JavaScript, un vrai `<button>` avec** | Amélioration progressive, et première règle d'ARIA : un bouton natif plutôt qu'un rôle | 4.1.2 |
| Boutons d'envoi **désactivés pendant l'envoi**, libellé « … en cours » | Pas de double envoi, et l'état du système est visible | Nielsen 1 |
| **Prix et niveau** sur chaque carte d'atelier | Étape 2 du parcours de Jonny : décider sans cliquer, avec un budget serré | Nielsen 6 |
| **Conditions d'utilisation lisibles** avant de les accepter (`<details>`, sans quitter la page) | On n'accepte plus à l'aveugle, et la saisie n'est pas perdue | 3.3.2, Nielsen 3 |
| **Heure des ateliers** sur chaque carte, et **filtre** « Le soir » / « Ouverts aux débutants » | Jonny travaille en journée, Mélanie consulte le soir. Le filtre est un `<fieldset>` avec sa `<legend>` ; le nombre d'ateliers affichés est annoncé (`role="status"`) sans déplacer le focus ; un message dit quoi faire si rien ne correspond | 1.3.1, 4.1.3 |
| **`aria-current`** sur le lien de la section visible | Sur une page unique à ancres, dire où l'on est ; le lien courant est souligné et en gras, pas seulement coloré | 1.4.1, 2.4.8 |
| **Appel aux formateurs** : son lien mène au formulaire avec « Formateur indépendant » déjà choisi | Persona Mélanie : « process trop long » | Nielsen 7 |
| **Balises de partage** `og:title` et `og:description` | Étape 1 du parcours de Jonny : un lien partagé sur Instagram ou LinkedIn doit dire ce qu'est SkillHub | — |
| Menu : **un clic en dehors le referme** (en plus d'Échap, qui rend le focus au bouton) | Le geste que tout le monde attend | — |
| **Le bouton du menu passe dans la `<nav>`**, seule la liste est cachée | Trouvé dans l'arbre d'accessibilité : sur mobile, menu fermé, toute la `<nav>` était cachée, donc **le repère « navigation » disparaissait** pour le lecteur d'écran. Ni Lighthouse ni axe ne le signalaient. Voir [`arbre-accessibilite.md`](arbre-accessibilite.md) | 1.3.1, 2.4.1 |
| **Suppression du fondu de couleur** sur les boutons | Trouvé en testant : au focus, le texte d'« Annuler » et de « Voir les ateliers » passait en blanc tout de suite, alors que le fond bleu arrivait en fondu sur 0,2 s. Pendant ce court instant : **blanc sur fond transparent, illisible**. axe le relevait une fois sur six, selon le moment de la mesure | 1.4.3 |
| Règle `[hidden] { display: none !important }` | Une classe en `display: flex` ne peut plus jamais annuler `hidden` | — |
| Case à cocher portée à **24 × 24 px** | Taille minimale d'une cible | 2.5.8 |
| Ratios de contraste **écrits dans le CSS**, à côté de chaque couleur | La mesure est dans le code : personne n'a à la refaire | 1.4.3, 1.4.11 |

---

## 3. Le balisage accessible, point par point

| Exigence du TP | Où, dans `src/index.html` |
|---|---|
| Menu avec `aria-expanded` et `aria-controls` | `<button class="menu-bouton" aria-expanded="false" aria-controls="menu">`. Le JS met `aria-expanded` à jour dans la même fonction que l'affichage |
| Deux navigations distinguées | `<nav aria-label="Navigation principale">` ; le pied de page n'est qu'une liste de liens, pas une `nav` |
| Modale en `dialog`, ouverte par `showModal()` | `<dialog id="modale-reservation" aria-labelledby="t-modale">`, annoncée par son titre |
| Libellés réellement liés | chaque champ a un `<label for>` ; aides et erreurs reliées par `aria-describedby` ; erreurs annoncées par `aria-live="polite"` ; `aria-invalid` sur le champ fautif |
| Lien d'évitement visible au focus | premier arrêt de tabulation, déplacé à l'écran au focus (jamais `display: none`) ; il mène à `<main id="contenu" tabindex="-1">` |
| Focus visible partout | `:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px }`, blanc sur le pied de page sombre ; aucun `outline: none` |
| Icônes | décoratives en `aria-hidden="true" focusable="false"`, le texte voisin porte le sens |
| Aucun ARIA inutile | pas de `role` sur un élément natif, pas d'`aria-hidden` sur un élément focusable |

---

## 4. Le parcours clavier commenté, sans souris

Relevé à 1280 px, touche Tab, du premier au dernier élément ; numéroté sur la page elle-même : [`ordre-tabulation-1280.png`](ordre-tabulation-1280.png) et [`ordre-tabulation-375.png`](ordre-tabulation-375.png). **23 arrêts, dans l'ordre du document**, contour de focus visible à chacun (3 px ; 6,04:1 au moins sur les fonds clairs, 14,84:1 en blanc sur le pied de page).

| # | Élément | Ce qui se passe |
|---|---|---|
| 1 | Lien « Aller au contenu » | Apparaît en haut à gauche, par-dessus l'en-tête. Entrée : le focus saute sur `main` |
| 2 | Logo « SkillHub » | Ramène en haut de page |
| 3–6 | Valeurs, Ateliers, Formateurs, S'inscrire | Navigation principale. Sur mobile, un bouton « Menu » les remplace : Entrée ouvre, Échap ferme **et rend le focus au bouton** |
| 7–8 | « Créer mon compte », « Voir les ateliers » | Les deux actions de l'accroche |
| 9–10 | Filtres « Le soir », « Ouverts aux débutants » | Espace coche ou décoche ; le nombre d'ateliers affichés est annoncé |
| 11–13 | « Réserver l'atelier … » (×3) | Chaque bouton dit **quel** atelier il réserve (texte masqué pour le lecteur d'écran). Entrée ouvre la modale |
| — | **Dans la modale** | Le focus arrive sur « Prénom et nom ». Tab circule **dans la modale seulement** (champs, Confirmer, Annuler). Échap ferme et rend le focus au bouton « Réserver » d'origine |
| 14 | « Créez votre compte » (appel aux formateurs) | Lien dans une phrase, mène au formulaire |
| 15–18 | Nom, courriel, profil, case « J'accepte » | Envoi incomplet : message sous chaque champ fautif, focus sur le premier |
| 19 | « Lire les conditions d'utilisation » | Entrée ou Espace déplie les conditions, sans quitter le formulaire |
| 20 | « Créer mon compte » | Passe à « Création en cours… », désactivé, puis confirmation annoncée (`role="status"`) |
| 21–23 | Pied de page | Haut de page, Ateliers, S'inscrire |

**Parcours arrière (Maj+Tab) :** même ordre inversé, aucun élément ne se retrouve caché sous l'en-tête collant (`scroll-padding-top: 5rem`). **Aucun piège** : la seule zone qui retient le focus est la modale, et on en sort toujours par Échap ou Annuler.

**Vérifié aussi :** aucun débordement horizontal à 320, 375, 800 et 1280 px (reflow, WCAG 1.4.10) ; sans JavaScript, le menu est affiché, « Réserver » reste un lien vers le formulaire, et la modale n'apparaît pas.

---

## 5. Les contrastes

Tableau complet, mesuré par la formule WCAG : [`fm02-contrastes.md`](fm02-contrastes.md). **17 paires, aucune en échec** ; le plus faible des textes est à 5,74:1 (message de succès), les composants et le focus sont tous au-dessus de 6:1.

---

## 6. Ce qui reste améliorable

C'est la partie que la fiche d'épreuve demande explicitement.

| # | Amélioration possible | Pourquoi | Priorité |
|---|---|---|---|
| 1 | **Tester avec un vrai lecteur d'écran** (NVDA sous Windows), en suivant [`test-nvda.md`](test-nvda.md) | Seul contrôle qui dit ce que la personne entend réellement ; les outils automatiques plafonnent autour de 30 % des critères | Haute |
| 2 | **Gérer les erreurs du serveur** (atelier complet, adresse déjà utilisée) avec un message qui dit quoi faire | Heuristique 9. Aujourd'hui l'envoi est simulé : il n'y a pas de back-end, donc pas d'erreur serveur possible | Moyenne, avec le back-end (BC02) |
| 3 | **Une vraie page de conditions**, versionnée et datée | Le `<details>` suffit pour une démonstration, pas pour un service réel | Moyenne |
| 4 | **Des photos de formateurs sous licence libre** | Les portraits actuels viennent de banques d'images : tolérés pour un projet d'école, pas pour une mise en ligne réelle | Moyenne |
| 5 | Vérifier le **zoom du texte à 200 %** sur un vrai téléphone (WCAG 1.4.4) | Tailles en `rem`, reflow à 320 px et zoom à 150 % vérifiés, mais pas sur un appareil réel | Basse |
| 6 | **Filtrer aussi par lieu** (en ligne / Paris) quand le catalogue grandira | Deux critères suffisent pour trois ateliers ; pas pour trente | Basse |

---

## 7. À faire avant de déposer (par moi)

- [x] Rapports **Lighthouse Accessibilité** avant et après, exportés en HTML
- [x] Arbre d'accessibilité relevé : [`arbre-accessibilite.md`](arbre-accessibilite.md)
- [ ] Exporter **Wave** avant et après, et reporter les chiffres dans le tableau 1
- [ ] Faire la **capture** de l'arbre d'accessibilité dans Chrome (DevTools → Elements → onglet Accessibility, bouton « Réserver » sélectionné) : `docs/arbre-accessibilite.png`
- [ ] Refaire le **parcours clavier** moi-même, sans souris, puis en Maj+Tab
