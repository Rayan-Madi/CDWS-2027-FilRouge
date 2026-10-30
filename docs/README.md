# Documents et rapports

| Fichier | Contenu |
|---|---|
| [`validateur-w3c.png`](validateur-w3c.png) | Validateur W3C : 0 erreur, 0 avertissement |
| [`tp1-erreurs-commentees.md`](tp1-erreurs-commentees.md) | Les trois erreurs commentées du TP 1 |
| [`lighthouse-avant.html`](lighthouse-avant.html) · [`lighthouse-apres.html`](lighthouse-apres.html) | Rapports Lighthouse exportés (mobile, navigation privée) |
| [`lighthouse-scores.png`](lighthouse-scores.png) | Capture des scores « avant » |
| [`tp2-bilan-performance.md`](tp2-bilan-performance.md) | Bilan avant / après : métriques et gestes |
| [`textes-alternatifs.md`](textes-alternatifs.md) | Textes de remplacement par catégorie |
| [`captures/`](captures/) | La page aux trois paliers : 375, 800 et 1280 px |

## FM02 — Ergonomie UX/UI et accessibilité

| Fichier | Contenu |
|---|---|
| [`fm02-tp1-personas-parcours.md`](fm02-tp1-personas-parcours.md) | TP 1 : personas Jonny (apprenant) et Mélanie (formatrice), parcours d'inscription de Jonny en six colonnes, ce que le parcours condamne |
| [`personas-hubspot/`](personas-hubspot/) | Les deux fiches HubSpot de départ |
| [`fm02-contrastes.md`](fm02-contrastes.md) | Contrastes mesurés par la formule WCAG (script : `outils/contrastes.js`) |
| [`fm02-tp4-accessibilite.md`](fm02-tp4-accessibilite.md) | TP 4 : rapport d'analyse d'accessibilité — mesures, changements, parcours clavier, améliorations possibles |
| [`lighthouse-a11y-avant.html`](lighthouse-a11y-avant.html) · [`lighthouse-a11y-apres.html`](lighthouse-a11y-apres.html) | TP 4 : rapports Lighthouse Accessibilité exportés |
| [`wave-avant.pdf`](wave-avant.pdf) · [`wave-apres.pdf`](wave-apres.pdf) | TP 4 : rapports Wave exportés (fin de FM01, puis page en ligne) |
| [`arbre-accessibilite.md`](arbre-accessibilite.md) | TP 4 : l'arbre d'accessibilité relevé (rôle, nom, état) |
| [`fm02-tp2-audit-nielsen.md`](fm02-tp2-audit-nielsen.md) | TP 2 : audit Nielsen de Studi — deux tâches, dix heuristiques notées, trois recommandations vérifiables, le défaut partagé avec SkillHub (les prérequis) |
| [`audit/`](audit/) | TP 2 : les captures de l'audit |
| [`design-system.html`](design-system.html) | TP 3 : jetons, les 4 composants et leurs états, cas limites, 3 paliers, ordre de tabulation |
| [`ordre-tabulation-1280.png`](ordre-tabulation-1280.png) · [`ordre-tabulation-375.png`](ordre-tabulation-375.png) | TP 3 : l'ordre de tabulation numéroté sur la page |
| [`fm02-tp3-guide-figma.md`](fm02-tp3-guide-figma.md) | TP 3 : construire le fichier Figma avec le plugin, le relire (règles du 4.3), faire jouer le parcours à deux camarades, les retours d'essai |
| [`../outils/figma-skillhub/`](../outils/figma-skillhub/) | TP 3 : le plugin Figma qui construit la maquette (variables, composants, trois paliers, tabulation, prototype) |
| [`test-nvda.md`](test-nvda.md) | TP 4 : le parcours à faire au lecteur d'écran NVDA, et ce qu'on doit entendre |
| [`revision-oral-ec01.md`](revision-oral-ec01.md) | Fiche de révision : les questions du correcteur, et où le montrer dans le code |

## FM03 — Applications web dynamiques et interactives

| Fichier | Contenu |
|---|---|
| [`fm03-tp1-comportement.md`](fm03-tp1-comportement.md) | TP 1 : modules, menu en délégation avec sous-menu, état sorti du DOM, validation au fil de la saisie, envoi, parcours au clavier relevé, ma gestion du focus en cinq phrases |
| [`fm03-tp1-code-fm02-annote.md`](fm03-tp1-code-fm02-annote.md) | TP 1 : le `skillhub.js` de FM02, annoté ligne par ligne, et ce que FM03 en a fait |
| [`fm03-tp2-typescript.md`](fm03-tp2-typescript.md) | TP 2 : tsconfig strict, les erreurs relevées et les bugs qu'elles cachaient, `types.ts`, le DOM typé sans `as`, zéro `any` |
| [`fm03-tp2-sortie-tsc.txt`](fm03-tp2-sortie-tsc.txt) | TP 2 : la sortie brute de `tsc`, avant toute correction (72 + 79 erreurs) |
| [`fm03-tp3-catalogue.md`](fm03-tp3-catalogue.md) | TP 3 : `ateliers.json`, `chargerAteliers()`, le filtre à état unique, les quatre états, les pannes provoquées, le parcours au clavier |
| [`captures/fm03/`](captures/fm03/) | TP 3 : les quatre états (chargement, vide, erreur 404, erreur hors ligne, succès), à 1280 et 375 px |
| [`superpowers/specs/2026-10-27-fm03-applications-dynamiques-design.md`](superpowers/specs/2026-10-27-fm03-applications-dynamiques-design.md) | La conception des trois TP |

## FM04 — React

| Fichier | Contenu |
|---|---|
| [`../react/`](../react/) | SkillHub en React (Vite, TypeScript, React Router, Tailwind) ; son README porte les trois sections exigées par la fiche EC02 |
| [`fm04-react.md`](fm04-react.md) | TP 1 point par point, ce qui est pris en avance sur le TP 2, le parcours clavier sur le build |

À faire par moi (FM02) : faire jouer le prototype Figma à deux camarades et remplir les retours d'essai, régler l'appareil du prototype sur 360 × 800 (TP 3) ; la capture de l'arbre d'accessibilité dans Chrome et le test NVDA (TP 4) ; relire l'audit Nielsen et rejouer ses deux tâches moi-même (TP 2).

À faire par moi (FM03) : rejouer le parcours au clavier sur la page en ligne et expliquer ma gestion du focus à un voisin sans regarder l'écran (TP 1, § 8) ; provoquer moi-même les pannes dans les outils de développement : case *Offline*, fichier renommé (TP 3, § 5) ; renommer un fichier `.ts` et lire une erreur à voix haute (TP 2).
