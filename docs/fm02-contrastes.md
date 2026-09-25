# FM02 — Contrastes mesurés

Mesurés avec la **formule WCAG 2.2** (celle du cours, slide 43), et non estimés à l'œil. Valeurs **tronquées** à deux décimales, comme le vérificateur de WebAIM.

Pour refaire la mesure : `node outils/contrastes.js`

| Paire | Ratio | Verdict |
|---|---|---|
| --texte sur --fond | 14,84:1 | ✓ AAA |
| --texte sur --fond-teinte | 13,45:1 | ✓ AAA |
| --texte-doux sur --fond | 7,52:1 | ✓ AAA |
| --texte-doux sur --fond-teinte | 6,82:1 | ✓ AA |
| --accent (liens) sur --fond | 6,66:1 | ✓ AA |
| --accent (liens) sur --fond-teinte | 6,04:1 | ✓ AA |
| blanc sur --accent (boutons) | 6,66:1 | ✓ AA |
| blanc sur --accent-fonce (survol) | 9,35:1 | ✓ AAA |
| --accent-fonce sur --accent-clair (étiquettes) | 7,96:1 | ✓ AAA |
| --erreur sur --fond | 6,53:1 | ✓ AA |
| --succes sur fond vert | 5,74:1 | ✓ AA |
| pied : #DBE4EE sur --texte | 11,55:1 | ✓ AAA |
| pied : liens blancs sur --texte | 14,84:1 | ✓ AAA |
| bordure de champ (--texte-doux) sur --fond | 7,52:1 | ✓ AA |
| focus (--accent) sur --fond | 6,66:1 | ✓ AA |
| focus (--accent) sur --fond-teinte | 6,04:1 | ✓ AA |
| focus blanc (pied) sur --texte | 14,84:1 | ✓ AA |
| bordure de carte (--bordure) sur --fond | 1,48:1 | décoratif, sans seuil |

**Seuils :** 4,5:1 pour le texte courant (WCAG 1.4.3, niveau AA), 3:1 pour les composants, les bordures de champ et le focus (WCAG 1.4.11), 7:1 pour le niveau AAA.

**Bilan : aucune paire n'échoue.** La seule sous 3:1 est la bordure grise des cartes (1,48:1). Elle est décorative : la carte n'est pas un élément interactif, et la hiérarchie tient par l'espace et les titres. Les **champs**, eux, sont bordés en `--texte-doux` (7,52:1).

Les ratios sont aussi écrits en commentaire à côté de chaque couleur dans `src/css/skillhub.css` : personne n'a à refaire la mesure pour vérifier.
