# Textes de remplacement, par catégorie (TP 2)

Test de relecture appliqué : images coupées, page lue à voix haute. Aucune phrase ne manque.

## 1. Images informatives

Elles apportent une information : le texte de remplacement transmet **cette information**, sans « image de ».

| Image | Texte de remplacement |
|---|---|
| `images/accroche-*.webp` (accroche) | « Une apprenante code sur son ordinateur portable pendant un atelier en ligne » |
| `images/thomas-martin-*.webp` | « Thomas Martin, designer UX/UI » |
| `images/aicha-ndiaye-*.webp` | « Aïcha N'Diaye, coach en reconversion » |

Les photos des formateurs suivent l'exemple du cours : le nom **et** le rôle, pour que la photo se comprenne seule (« Sarah Benali, formatrice en développement web »).

## 2. Images fonctionnelles

Elles sont dans un lien ou un bouton : le nom accessible décrit **l'action**, jamais l'icône.

| Image | Élément | Nom accessible | Comment |
|---|---|---|---|
| Logo SVG « S » | lien vers `#accroche` | « SkillHub » | Le texte visible du lien suffit ; le SVG est en `aria-hidden="true"` pour ne pas être lu deux fois |
| Icône « hamburger » (3 traits) | bouton du menu mobile | « Menu » | Texte visible dans le bouton ; SVG en `aria-hidden="true"`. L'état ouvert/fermé est annoncé par `aria-expanded` |

## 3. Images décoratives

Elles n'ajoutent rien au texte voisin : elles sont **ignorées** par le lecteur d'écran.

| Image | Technique |
|---|---|
| Icônes des valeurs (Proximité, Transparence, Exigence), SVG en ligne | `aria-hidden="true"` + `focusable="false"` — le titre `h3` porte déjà le sens |
| Pastille d'initiales (SB), en attendant la photo de Sarah Benali | `aria-hidden="true"` — le nom complet est dans le `h3` juste après |

> Pour une balise `<img>` décorative, on écrirait `alt=""` (attribut **présent et vide**). Ici toutes les images décoratives sont des SVG en ligne ou du texte : c'est `aria-hidden="true"` qui joue ce rôle.

## Cas particulier : les boutons « Réserver »

Trois boutons portent le même texte visible. Un texte **visuellement masqué** les distingue pour le lecteur d'écran : « Réserver l'atelier Initiation à Git », etc.
