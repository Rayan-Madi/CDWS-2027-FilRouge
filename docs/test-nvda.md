# Tester SkillHub avec le lecteur d'écran NVDA (Windows) — 20 minutes

> « Ce que la personne entend vraiment : le seul contrôle qui tranche » (cours FM02, 6.5). Aucun outil automatique ne le remplace.

## Installer et démarrer
1. Télécharger NVDA, gratuit : **nvaccess.org** → Download.
2. L'installer ou le lancer en version portable. Une voix annonce « NVDA démarré ».
3. Ouvrir Chrome sur `https://rayan-madi.github.io/CDWS-2027-FilRouge/src/`.
4. **Arrêter NVDA** à tout moment : `Insert` + `Q`. Couper la parole : `Ctrl`.

La touche **NVDA** est `Insert` (ou `Verr. Maj` selon la configuration).

## Les touches utiles (mode navigation)

| Touche | Effet |
|---|---|
| `H` / `Maj+H` | Titre suivant / précédent |
| `1`, `2`, `3` | Titre de niveau 1, 2, 3 suivant |
| `D` | Repère suivant (bannière, navigation, principal, région…) |
| `B` | Bouton suivant |
| `F` | Champ de formulaire suivant |
| `Tab` | Élément interactif suivant |
| `NVDA + F7` | Liste de tous les titres, liens et repères |
| `Entrée`, `Espace` | Activer ; dans un champ, NVDA passe en mode saisie |

## Le parcours à faire, et ce qu'on doit entendre

Coche chaque ligne. Si NVDA annonce autre chose, note-le : c'est une vraie trouvaille pour le rapport du TP 4.

| # | Geste | Annonce attendue (en substance) | OK ? |
|---|---|---|---|
| 1 | `Tab` depuis le haut de la page | « Aller au contenu, lien » | ☐ |
| 2 | `NVDA + F7`, onglet Titres | Un seul titre de niveau 1, « Reprenez la main sur votre reconversion », puis les h2 et les h3 | ☐ |
| 3 | `D` plusieurs fois | « bannière », « Navigation principale, navigation », « principal », puis une région par section (« Nos valeurs, région »…) | ☐ |
| 4 | Téléphone ou fenêtre étroite : `Tab` jusqu'à « Menu », `Entrée` | « Menu, bouton, réduit », puis « développé » | ☐ |
| 5 | Dans « Les ateliers du moment » : `Espace` sur « Le soir » | « Le soir, case à cocher, cochée », puis « 2 ateliers affichés » | ☐ |
| 6 | `B` jusqu'à un « Réserver » | « Réserver l'atelier Initiation à Git, bouton » (et non juste « Réserver ») | ☐ |
| 7 | `Entrée` sur ce bouton | « Réserver : Initiation à Git, boîte de dialogue », puis « Prénom et nom, zone d'édition, obligatoire » | ☐ |
| 8 | Dans la modale, `Tab` jusqu'à « Confirmer la réservation », `Entrée` sans rien saisir | « Indiquez votre prénom et votre nom » ; le champ est annoncé « invalide » | ☐ |
| 9 | `Échap` | La modale se ferme ; le focus revient sur « Réserver l'atelier Initiation à Git, bouton » | ☐ |
| 10 | `F` jusqu'à « Adresse électronique » | « Adresse électronique, zone d'édition, obligatoire, Nous ne la transmettons à personne » | ☐ |
| 11 | Envoyer le formulaire complet | « Création en cours… », puis la confirmation lue sans qu'on ait à la chercher | ☐ |
| 12 | Les photos des formateurs (flèche bas) | « Sarah Benali, développeuse web, graphique » ; les icônes des valeurs ne sont **pas** lues | ☐ |

## Pour le rapport
Une phrase suffit par écart constaté : ce qui était attendu, ce qui a été entendu, ce que tu corriges. S'il n'y a aucun écart, écris-le aussi : « parcours complet au lecteur d'écran NVDA 2026.x, Chrome, sans écart ».
