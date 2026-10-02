# FM02 · TP 3 — Design system et maquette Figma

> Quatre composants, trois paliers, six états, contrastes mesurés. Livrable : **le fichier Figma partagé**.

Le fichier Figma est construit par un plugin du dépôt, [`outils/figma-skillhub/`](../outils/figma-skillhub/), à partir des **mêmes jetons et du même contenu que la page**. Des tests vérifient que les jetons du plugin sont ceux de `skillhub.css` et que chaque texte repris de la page figure bien dans `index.html` ou `skillhub.js` (les quelques textes propres à la maquette, comme le titre long du cas limite ou la saisie de Jonny, sont rangés à part) : la maquette et le code ne peuvent pas diverger sans que ça se voie.

## Ce que contient le fichier, exigence par exigence

| Exigence du TP 3 | Dans le fichier Figma | Vérifié par |
|---|---|---|
| 1. Jetons : tailles de texte, pas d'espacement, couleurs, **ratio mesuré à côté** | Page 1 : 31 variables (collection `SkillHub`) aux noms du CSS, avec la syntaxe de code `var(--…)` ; la description de chaque couleur donne ses ratios ; planche des jetons ; 12 styles de texte (10 crans liés aux variables de taille, 2 titres fluides à 768) | `tests/jetons.test.js` : jetons == `:root`, ratios == [`fm02-contrastes.md`](fm02-contrastes.md) |
| 2. Quatre composants et leurs variantes, six états pour les interactifs | Page 1 : `bouton` (principal, secondaire × repos, survol, focus, actif, désactivé, chargement), `champ` (texte, liste × repos, survol, focus, rempli, erreur, désactivé), `carte-atelier`, `modale` (saisie, erreur, envoi, confirmée) | `tests/construction.test.js` |
| 3. La landing aux **trois paliers**, en auto-layout, contenu réel | Page 2 : frames `360`, `768`, `1280`, grille de colonnes, vraies photos, vrais titres et vrais prix | `tests/construction.test.js` (frames, grille, images) et `tests/contenu.test.js` (textes) |
| 4. Cas limites : titre de trois lignes, catalogue vide, champ en erreur | Page 1, bloc « Cas limites » | `tests/construction.test.js` |
| 5. Ordre de tabulation numéroté, du lien d'évitement au pied de page | Page 2 : `1280 · tabulation` (1 → 23) et `360 · tabulation` (1 → 20) | `tests/contenu.test.js` (l'ordre) et `tests/construction.test.js` (les pastilles) |
| 6. Prototype joué par deux camarades, hésitations notées, une correction | Page 3 : flow « Réserver un atelier le soir » | **à faire en séance** (ci-dessous) |
| Le fichier Figma partagé | [« SkillHub — TP 3 (maquette) »](https://www.figma.com/design/U5GPUXYkhMkvnJTPGsbjxT) | construit et **partagé en lecture** (ouvert sans compte le 30/09/2026) |

## 1. Construire le fichier (5 minutes)

> **Déjà fait le 30/09/2026.** Le fichier [« SkillHub — TP 3 (maquette) »](https://www.figma.com/design/U5GPUXYkhMkvnJTPGsbjxT) a été construit par le code de ce plugin, exécuté par le serveur MCP de Figma (`use_figma`) en trois appels, un par page. Les vraies photos ont été téléversées en JPEG. Toutes les étapes sont ✓. Les étapes ci-dessous servent à le **reconstruire** (nouveau fichier). Le partage (étape 7) est fait ; le réglage de l'appareil du prototype (étape 6) est facultatif.

> **Correctif du 02/10/2026, à lancer une fois.** Testé sur téléphone, le prototype restait bloqué sur « Réservation en cours… ». L'écran d'envoi était une superposition remplacée, et Figma n'y déclenche pas le « After delay ». Le plugin est corrigé. Pour le fichier déjà construit, lance le correctif dans Figma Desktop : Plugins → Development → Import plugin from manifest… → `outils/figma-skillhub/correctif-prototype/manifest.json`, puis lance-le (message attendu : « 9 liens corrigés »). Le détail est dans le [README du plugin](../outils/figma-skillhub/README.md#correctif-du-prototype-02102026).

1. Installer **Figma Desktop** (figma.com/downloads) : les plugins en développement ne tournent pas dans le navigateur.
2. Créer un **nouveau fichier Design vide** et le nommer « SkillHub — TP 3 ».
3. Clic droit sur le canevas → **Plugins → Development → Import plugin from manifest…** → `outils/figma-skillhub/manifest.json`.
4. Clic droit → **Plugins → Development → SkillHub — maquette du TP 3**. Attendre le message final.
5. Lire le **rapport du plugin** en haut de la page 1 : toutes les lignes doivent commencer par ✓ (un ⚠ signale un repli, par exemple une image non téléchargée).
6. Page 3, panneau *Prototype* : régler l'appareil sur **360 × 800**.
7. **Partager** : bouton *Share* → *Anyone with the link* → *can view* → copier le lien ici :
   - Lien du fichier : https://www.figma.com/design/U5GPUXYkhMkvnJTPGsbjxT (partagé en lecture ; vérifié dans un navigateur sans compte le 30/09/2026)

## 2. Relire avant de faire jouer (10 minutes) — les règles du cours, 4.3

Relu le 01/10/2026 dans le fichier, par des scripts de lecture passés par le serveur MCP de Figma. La preuve de chaque case est notée à côté.

- [x] **Nommer** : aucun `Rectangle 47`. Les variantes s'appellent `type=principal, état=focus`. *Relecture : 53 tracés d'icônes s'appelaient encore « Vector » ; ils sont renommés (« tracé 1 »…), et le plugin les nomme désormais lui-même (test « aucun calque ne garde un nom par défaut »).*
- [x] **Grille** : afficher les grilles (Ctrl + G) sur les trois frames ; les blocs tombent sur les colonnes. *4 colonnes (marge 16, gouttière 16) à 360, 8 (32, 24) à 768, 12 (64, 24) à 1280 ; les marges des sections valent la marge de la grille.*
- [x] **Trois paliers** : menu « Menu » à 360, liens dès 768, accroche en deux colonnes dès 768, trois cartes par rangée à 1280. *Relevé : Menu seul à 360 ; liens à 768 et 1280 ; accroche verticale à 360, horizontale ensuite ; 1, 2 puis 3 cartes par rangée, boutons alignés à 1280.*
- [x] **Six états** : ouvrir `bouton` et `champ`. Le focus est un anneau posé **sur le fond** (3 px, décalé de 3 px). *bouton : repos, survol, focus, actif, désactivé, chargement ; champ : repos, survol, focus, rempli, erreur, désactivé ; anneau de 3 px lié à `accent`, posé à 6 px du bord (3 px d'écart + 3 px d'épaisseur).*
- [x] **Contenu réel** : les titres, prix, dates et formateurs sont ceux de la page. *Vérifié par `tests/contenu.test.js`.*
- [x] **Cas limites** : la carte au titre de trois lignes garde son bouton aligné ; le catalogue vide dit quoi faire. *Capture du 30/09 : titre sur trois lignes, bouton dans la carte ; filtres cochés, « 0 atelier affiché » et message en pointillés.*
- [x] **Contrastes** : sélectionner un texte → onglet de contraste de Figma. Les chiffres sont aussi dans la description des variables. *Chaque couleur porte ses ratios mesurés (ex. `accent` : 6,66:1 sur fond, 6,04:1 sur fond-teinte) ; ils sont recalculés par `tests/jetons.test.js`.*
- [x] **Ordre de lecture** : les pastilles vont de 1 (lien d'évitement) au dernier lien du pied de page, sans saut. *1 → 23 à 1280, 1 → 20 à 360, sans trou ; c'est aussi l'ordre réel de la page, rejoué au clavier le 01/10 (rapport du TP 4, § 4).*
- [x] **Liaisons** : sélectionner un bouton → le fond affiche `accent` (variable), pas un hexadécimal. *Bouton au repos : fond `couleurs/accent`, marge `espace/e-6`, rayon `forme/pilule`, hauteur min. `forme/cible` ; aucune couleur brute dans les composants (hors le blanc des libellés, `#fff` dans le CSS aussi).*

## 3. Faire jouer le parcours à deux camarades (20 minutes)

**Préparer** : ouvrir le prototype (page 3, bouton *Present*) sur la frame `Landing 360`, fenêtre à la taille d'un téléphone.

**Consigne à lire, mot pour mot, puis se taire** :

> « Tu es Jonny, 23 ans. Tu as vu passer un lien vers SkillHub dans le métro. Tu veux réserver l'atelier "Initiation à Git" de mercredi soir. Vas-y, et dis à voix haute ce que tu penses. Je ne peux pas t'aider. »

**Pendant l'essai** :
- Ne rien montrer, ne rien expliquer, ne pas toucher l'écran. Si la personne demande « je clique où ? », répondre « qu'est-ce que tu ferais ? ».
- Noter **l'endroit exact** de chaque hésitation (plus de 3 secondes sans agir, un retour en arrière, un « euh »), et **ce qu'elle a dit**.
- Le prototype simule une faute de frappe : l'adresse `jonny@gmail` déclenche l'erreur. Observer si le message suffit à comprendre quoi corriger. Toucher le champ en erreur corrige la saisie.

**Après** : deux questions seulement. « Qu'est-ce qui t'a fait hésiter ? » et « Qu'est-ce que tu t'attendais à voir après avoir confirmé ? »

**Corriger au moins une chose** : dans le fichier Figma, puis, si la correction touche la page, dans `src/`. Noter dans le tableau ce qui a été changé et où.

## 4. Les deux retours d'essai

| Camarade | Où a-t-il hésité ? (écran, élément, ce qu'il a dit) | Ce que j'ai corrigé (dans Figma et, si besoin, dans le code) |
|---|---|---|
| 1 : _prénom_ | | |
| 2 : _prénom_ | | |

## 5. Ce qu'un assistant a fait, ce que j'ai vérifié

Le plugin a été écrit avec un assistant de code (cours, 4.5 : « l'assistant, puis vous »). Ce que je peux montrer au jury :

- **Les jetons ne sont pas recopiés à la main** : un test compare chaque variable au `:root` de `skillhub.css`, et chaque ratio au rapport de contrastes.
- **Le contenu n'est pas du faux texte** : un test retrouve dans `index.html` ou `skillhub.js` chaque texte que la maquette reprend de la page ; les rares textes propres à la maquette (titre long du cas limite, saisie de Jonny, libellé « Complet · liste d'attente ») sont rangés à part, dans `MAQUETTE` (`code.js`).
- **Ce qu'aucun outil ne vérifie à ma place** : le contraste perçu, la lisibilité à 150 % de zoom (Mélanie), l'ordre de tabulation réel dans le navigateur (TP 4, au clavier et au lecteur d'écran), et le test avec de vraies personnes (section 3).
