# FM02 · TP 1 — Deux personas et un parcours d'inscription

> Le but n'est pas d'avoir de jolies fiches : chaque fiche doit trancher au moins une décision d'interface.

**Point de départ :** deux fiches créées le 25/09/2026 avec le générateur de personas de HubSpot ([`personas-hubspot/`](personas-hubspot/)). Elles donnaient des objectifs, des freins et des canaux d'information, mais aucun des champs qui décident d'une interface : ni contexte d'usage, ni contraintes d'accès. Ce document les reprend et les complète au format du cours.

**Sur quoi ils reposent :** ce sont des **proto-personas**. Les éléments repris des fiches HubSpot sont mes hypothèses de départ ; les champs ajoutés (contexte, aisance, contraintes d'accès) sont des **hypothèses assumées**, signalées comme telles. Aucun entretien n'a encore été mené.

---

## Persona 1 — Jonny, 23 ans, étudiant qui veut basculer vers le numérique (côté apprenant)

| Champ | Contenu |
|---|---|
| **Contexte d'usage** | Sur son téléphone, dans les transports ou en pause pendant son job étudiant en magasin. Il arrive souvent **depuis un lien partagé sur Instagram ou LinkedIn**, ouvert dans le navigateur intégré de l'application, en 4G. |
| **Objectif** | « Être à jour sur les technologies » : trouver un atelier court sur un outil qu'on demande dans les offres de stage, et le réserver avant la station suivante. |
| **Aisance** | Très à l'aise avec son téléphone et les réseaux sociaux ; beaucoup moins avec les formulaires longs et le vocabulaire administratif. |
| **Freins** | « Ressources limitées » : un budget serré, donc un prix qui n'apparaît qu'à la fin le fait fuir. Une réservation qui l'oblige à tout recommencer s'il se trompe. |
| **Contraintes d'accès** | **Situationnelles** : une seule main libre, debout dans le métro, écran en plein jour ; il tape vite au pouce et fait des fautes de frappe. Connexion 4G irrégulière entre deux stations. |
| **Sur quoi il repose** | Fiche HubSpot « Jonny » (objectifs, freins, canaux d'information) + hypothèses assumées pour le contexte et les contraintes d'accès. À vérifier par trois entretiens d'étudiants de ma promotion. |

**Deux décisions qu'il tranche**
1. **Le prix, le niveau et la durée sont sur la carte d'atelier.** Avec un budget serré, c'est la première chose qu'il regarde, et il doit décider sans ouvrir une autre page.
2. **La réservation tient dans une modale courte, deux champs, qui reprend l'atelier choisi.** S'il se trompe, sa saisie est conservée et l'erreur lui dit quoi corriger.

**Une idée qu'il fait abandonner**
Une **vidéo de présentation en lecture automatique** en haut de page : lourde en 4G, bruyante dans le métro, et elle repousse sous l'écran le prix et les ateliers qu'il est venu chercher.

---

## Persona 2 — Mélanie, 38 ans, ancienne cadre devenue formatrice indépendante (côté formateur)

| Champ | Contenu |
|---|---|
| **Contexte d'usage** | Sur son ordinateur portable, le soir, après ses journées de formation. Elle y passe dix minutes, pas plus, entre deux tâches administratives. |
| **Objectif** | « Stabilité financière » : remplir ses sessions sans passer ses soirées à démarcher, et savoir en une minute ce que SkillHub lui apporte et comment commencer. |
| **Aisance** | À l'aise avec les outils en ligne (Master, cadre pendant dix ans), mais aucune envie d'apprendre une interface de plus. |
| **Freins** | « **Process trop long** » : un formulaire de candidature en plusieurs étapes et elle abandonne. « **Être prise pour une simple d'esprit** » : une interface qui explique l'évidence ou des messages infantilisants la font fuir. Sa « **charge mentale** » et son « **équilibre vie pro / vie perso** » : tout ce qui lui demande de revenir plus tard est perdu. |
| **Contraintes d'accès** | **Fatigue visuelle** en fin de journée : elle agrandit le zoom du navigateur à 150 %. Elle remplit les formulaires **au clavier** (Tab, Entrée) pour aller plus vite. |
| **Sur quoi il repose** | Fiche HubSpot « Mélanie » (objectifs, défis, ce qu'elle n'aime pas) + hypothèses assumées pour le contexte et les contraintes d'accès. À vérifier par deux entretiens de formateurs indépendants. |

**Deux décisions qu'elle tranche**
1. **La page d'accueil parle aussi aux formateurs, et le chemin est court** : une phrase dans la section des formateurs, un lien qui mène au formulaire **avec « Formateur indépendant » déjà choisi**, et un seul écran d'inscription.
2. **Des messages qui expliquent sans infantiliser** : « L'adresse doit ressembler à nom@exemple.fr » plutôt que « Erreur : champ invalide » ou un texte d'aide qui répète l'évidence. Et **tout se fait au clavier**, avec un focus toujours visible, y compris zoomé à 150 %.

**Une idée qu'elle fait abandonner**
Un **dossier de candidature formateur dès l'inscription** (CV, diplômes, vidéo de présentation, en quatre étapes). On crée d'abord le compte en un écran ; le reste se demande plus tard, au moment de publier un atelier.

---

## User journey d'inscription — Jonny

Tâche : « Je découvre SkillHub par un lien partagé et je réserve un atelier. »

| Étape | Point de contact | Action | Attente | Douleur | Décision |
|---|---|---|---|---|---|
| **1. Découverte** | Lien partagé sur Instagram ou LinkedIn | Touche le lien, la page s'ouvre dans le navigateur de l'application | Voir tout de suite de quoi il s'agit | **L'aperçu du lien ne dit rien** : pas de titre ni de description propres à SkillHub | Balises de partage (`og:title`, `og:description`) en plus de la `meta description` |
| **2. Exploration** | Section « Les ateliers du moment » | Fait défiler les cartes du pouce | Comparer vite le prix et le niveau | **Ni prix ni niveau sur les cartes** : impossible de comparer avec un budget serré | Prix, niveau et durée sur chaque carte |
| **3. Décision** | Bouton « Réserver » d'une carte | Touche « Réserver » | Réserver **cet** atelier | **Le formulaire ne sait pas quel atelier il a choisi** : il doit s'en souvenir | Une modale qui reprend l'atelier choisi (titre, date, prix) |
| **4. Saisie** | Formulaire de la modale | Tape son nom et son adresse au pouce | Finir avant la station suivante | **Une faute de frappe dans l'adresse n'est signalée qu'à l'envoi**, et il ne sait pas quoi corriger | L'erreur s'affiche en quittant le champ, dit quoi faire, et la saisie est conservée |
| **5. Envoi** | Bouton de confirmation | Touche le bouton en 4G lente | Savoir que c'est pris | **Rien ne bouge** : il touche deux ou trois fois | Le bouton passe à « Réservation en cours… » et se désactive |
| **6. Confirmation** | Message dans la modale | Lit la confirmation | Savoir quand et où a lieu l'atelier | **La confirmation ne rappelle ni l'atelier ni la date** | Le message reprend l'atelier, la date, le lieu et l'adresse où arrivera le lien |

**Six douleurs, six décisions.** Le creux du parcours est aux étapes 2 et 3 : c'est là qu'on perd Jonny, donc là qu'on travaille en premier.

---

## Ce que le parcours condamne dans la page de FM01, et ce qui en a été fait

| # | Ce qui était condamné | Qui le condamne | Heuristique de Nielsen | État |
|---|---|---|---|---|
| 1 | Aperçu de lien **sans titre ni description** propres | Jonny (étape 1) | 2 — correspondance avec le monde réel | Corrigé au TP 4 |
| 2 | Cartes d'atelier **sans prix ni niveau** | Jonny (étape 2) | 6 — reconnaître plutôt que se souvenir | Corrigé au TP 4 |
| 3 | « Réserver » qui **perd l'atelier choisi** | Jonny (étape 3) | 6 — reconnaître plutôt que se souvenir | Corrigé au TP 4 (modale) |
| 4 | Bouton d'envoi **sans état « en cours »** | Jonny (étape 5) | 1 — visibilité de l'état du système | Corrigé au TP 4 |
| 5 | Confirmation **sans détail** | Jonny (étape 6) | 1 et 9 | Corrigé au TP 4 |
| 6 | **Rien pour les formateurs**, sauf une option du menu « Je suis » | Mélanie | 2 — correspondance avec le monde réel | Corrigé au TP 4 (appel aux formateurs, profil présélectionné) |
| 7 | Case « J'accepte les conditions » **sans accès aux conditions** | Mélanie (« être prise pour une simple d'esprit » : on ne signe pas à l'aveugle) | 3 — contrôle et liberté ; 10 — aide | Corrigé au TP 4 |
| 8 | **Aucune heure** sur les ateliers, aucun filtre (soir, débutant) | Jonny (job étudiant), Mélanie (le soir) | 7 — souplesse et efficacité | **Reste à faire** (voir le rapport du TP 4) |

**Ce que la page faisait déjà bien, et qu'on garde :** l'accroche qui dit à qui s'adresse le service ; la page légère (image d'accroche de 28 Kio en 4G) ; les messages d'erreur écrits en clair, qui conservent la saisie ; la navigation au clavier ; les contrastes, tous mesurés au-dessus de 4,5:1 (voir [`fm02-contrastes.md`](fm02-contrastes.md)).
