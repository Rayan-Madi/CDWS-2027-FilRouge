# TP 1 — Les trois erreurs qui m'ont le plus appris

Le validateur W3C n'a relevé aucune erreur ([capture](validateur-w3c.png)). Les trois erreurs ci-dessous sont des erreurs **de sens** qu'il ne voit pas : la page était valide, mais pas encore juste. Le validateur vérifie que le code est **correct**, pas qu'il est **bon**.

## 1. Un `<nav>` autour des liens du pied de page

```html
<!-- Avant -->
<footer>
  <nav aria-label="Pied de page">
    <ul> <li><a href="#accroche">Haut de page</a></li> … </ul>
  </nav>
</footer>

<!-- Après -->
<footer>
  <ul class="pied__liens"> <li><a href="#accroche">Haut de page</a></li> … </ul>
</footer>
```

**Ce que j'ai compris :** `nav` annonce un bloc de navigation **majeur**, que le lecteur d'écran propose comme raccourci. Trois liens de confort en pied de page n'en sont pas un : en ajoutant une deuxième `nav`, je diluais la vraie, la principale. Un groupe de liens n'est pas forcément une navigation.

## 2. L'étiquette avant le titre dans les fiches d'atelier

```html
<!-- Avant -->
<article class="atelier">
  <p class="atelier__etiquette">Développement</p>
  <h3>Initiation à Git</h3>

<!-- Après -->
<article class="atelier">
  <h3>Initiation à Git</h3>
  <p class="atelier__etiquette">Développement</p>
```

**Ce que j'ai compris :** j'avais écrit le HTML dans l'ordre **visuel** que je voulais (la pastille au-dessus du titre). Mais un lecteur d'écran qui navigue de titre en titre arrive sur le `h3` et **saute** l'étiquette placée avant lui. Le titre doit ouvrir l'`article`. L'ordre du document passe avant l'allure, et l'apparence se règle en CSS.

## 3. Un `<p>` pour une pastille décorative

```html
<!-- Avant -->
<p class="formateur__avatar" aria-hidden="true">SB</p>

<!-- Après -->
<div class="formateur__avatar" aria-hidden="true">SB</div>
```

**Ce que j'ai compris :** « SB » n'est pas un paragraphe, c'est un décor. Je l'avais mis en `<p>` parce que je voulais éviter les `div`. Mais la `div` n'est pas interdite : elle est **le dernier choix**, légitime quand l'élément n'a aucun sens et sert seulement de crochet de style. Choisir `p` pour éviter `div`, c'est encore choisir la balise pour de mauvaises raisons.

> Depuis, les pastilles d'initiales ont été remplacées par les photos des formateurs (TP 2).

## Ce que je retiens

Les trois erreurs ont la même cause : j'ai choisi une balise en pensant à **l'apparence** ou à une règle apprise par cœur, au lieu de me demander « que suis-je ? ». La question du cours (« la question est "que suis-je ?", jamais "à quoi dois-je ressembler ?" ») règle les trois.
