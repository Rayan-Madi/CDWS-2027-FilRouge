# TP 2 — Bilan de performance avant / après

**Conditions identiques pour les deux mesures :** Lighthouse 13.4.1 dans Chrome, mode **mobile**, **navigation privée**, page en ligne `https://rayan-madi.github.io/CDWS-2027-FilRouge/src/`, le 24/09/2026.

| | Avant (19 h 12) | Après (19 h 19) |
|---|---|---|
| Rapport | [`lighthouse-avant.html`](lighthouse-avant.html) | [`lighthouse-apres.html`](lighthouse-apres.html) |
| **Performance** | 97 | **99** |
| Accessibilité · Bonnes pratiques · SEO | 100 · 100 · 100 | 100 · 100 · 100 |

## Les trois métriques

| Métrique | Seuil | Avant | Après | Quel geste l'a fait bouger |
|---|---|---|---|---|
| **LCP** | ≤ 2,5 s | 1,2 s | 1,2 s | Stable. Le LCP est l'image d'accroche : elle était déjà en WebP, sans `loading="lazy"`, en `fetchpriority="high"`. La police du titre est préchargée. |
| **CLS** | ≤ 0,1 | 0 | 0 | Stable à zéro grâce à `width` et `height` posés sur l'image, et à `font-display: swap` sur une police préchargée. |
| **TBT** | ≤ 200 ms | 190 ms | 140 ms | **Pas notre code.** La plus longue tâche (242 ms, puis 186 ms) est « Unattributable » : c'est le travail du navigateur et de DevTools pendant la mesure. Le JavaScript de la page ne s'exécute qu'en 17 ms (script en `defer`). L'écart vient de la variabilité de la mesure. |

Autres mesures : First Contentful Paint 1,0 s → 0,9 s ; Speed Index 1,3 s → 1,0 s.

## Le problème relevé et le geste correctif

**Constat (rapport avant) :** l'audit *Improve image delivery* signale **25 Kio gaspillés**. Sur mobile, le navigateur téléchargeait `accroche-800.webp` (33 Kio) alors que l'image s'affiche dans environ 380 px de large.

**Cause :**
1. `sizes="(min-width: 48em) 50vw, 100vw"` annonçait une image **pleine largeur**, sans tenir compte des marges de la page.
2. Le mobile simulé a une densité d'écran de 1,75 : il lui faut environ 380 × 1,75 ≈ 665 px. Entre 400 et 800, il ne pouvait prendre que 800.

**Geste :**
- Ajout d'une variante `accroche-700.webp`.
- `sizes` décrit la largeur **réellement affichée** : `calc(100vw - 2rem)` sur mobile, `calc(50vw - 3rem)` en tablette, `30rem` sur ordinateur.

**Résultat (rapport après) :** le mobile télécharge `accroche-700.webp` (**28 Kio au lieu de 33**), le score passe de **97 à 99**. L'audit propose encore 19 Kio : il compare au pixel près, et une variante par largeur d'écran ne se justifie pas pour 19 Kio.

## Les six gestes du cours, appliqués dès l'écriture

| Geste | Où |
|---|---|
| 1. Images à leur taille d'affichage | `srcset` 400 / 700 / 800 px, `sizes` exact |
| 2. WebP | toutes les images matricielles |
| 3. Dimensions sur chaque image | `width="800" height="492"` → CLS 0 |
| 4. Chargement différé sauf l'accroche | aucune autre image matricielle dans la page ; l'accroche n'est **jamais** en `lazy` |
| 5. `defer` sur les scripts | `js/skillhub.js` |
| 6. Police auto-hébergée | Sora en woff2, 2 graisses, `font-display: swap`, 600 préchargée |

C'est pour cela que la mesure « avant » était déjà à 97 : les gestes ont été posés à l'écriture, pas en fin de projet. Le cours le dit : « la performance est une fonctionnalité ».
