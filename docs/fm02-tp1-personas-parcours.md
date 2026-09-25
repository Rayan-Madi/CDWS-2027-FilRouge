# FM02 · TP 1 — Deux personas et un parcours d'inscription

> Le but n'est pas d'avoir de jolies fiches : chaque fiche doit trancher au moins une décision d'interface.

Rédigé le 25/09/2026. **Les deux personas sont des proto-personas** : ils reposent sur des hypothèses assumées, pas encore sur des entretiens. La ligne « Sur quoi il repose » le dit pour chacun.

---

## Persona 1 — Nadia, 41 ans, aide-soignante en reconversion (côté apprenant)

| Champ | Contenu |
|---|---|
| **Contexte d'usage** | Sur un téléphone Android d'entrée de gamme, pendant ses pauses de 15 minutes à l'hôpital, souvent debout, avec une 4G irrégulière. |
| **Objectif** | Savoir en moins d'une minute si un atelier est fait pour une débutante, quand il a lieu et combien il coûte, avant de donner son adresse. |
| **Aisance** | À l'aise avec WhatsApp et Doctolib. Le vocabulaire du métier (« front », « stack », « repo ») ne lui dit rien. |
| **Freins** | Un prix qui n'apparaît qu'après l'inscription ; un compte à créer avant de voir quoi que ce soit ; un formulaire long qu'on remplit du pouce. |
| **Contraintes d'accès** | Presbytie débutante : elle agrandit le texte de son téléphone. Elle tient le téléphone d'une main : les petites cibles la font se tromper. Connexion lente : une page lourde, elle abandonne. |
| **Sur quoi il repose** | Hypothèse assumée, construite à partir du public visé par SkillHub (« apprenants en reconversion »). À vérifier par trois entretiens avec des personnes en reconversion. |

**Deux décisions qu'elle tranche**
1. **Le prix, le niveau et la durée sont sur la carte d'atelier**, pas seulement dans une fiche détaillée. Elle doit décider sans cliquer.
2. **La page reste lisible avec le texte agrandi** (tailles en `rem`, aucune hauteur fixe sur les cartes) et **les cibles sont assez grandes pour le pouce** : boutons et champs de 44 px de haut, case à cocher de 24 px au minimum (WCAG 2.5.8).

**Une idée qu'elle fait abandonner**
Un carrousel animé d'ateliers en haut de page : il bouge pendant qu'elle lit, ses flèches sont de petites cibles, il pèse lourd en 4G, et il cache les ateliers qu'il ne montre pas.

---

## Persona 2 — Julien, 38 ans, formateur indépendant en design UX (côté formateur)

| Champ | Contenu |
|---|---|
| **Contexte d'usage** | Sur un ordinateur portable, entre deux missions clients, avec une dizaine d'onglets ouverts. Il consulte SkillHub par à-coups de cinq minutes. |
| **Objectif** | Comprendre ce que SkillHub lui apporte (des apprenants, sans démarchage) et ce que ça lui coûte, puis proposer un premier atelier. |
| **Aisance** | Très à l'aise avec les outils en ligne, mais aucune patience pour une interface de plus à apprendre. |
| **Freins** | Devoir créer un compte avant de connaître les conditions (commission, paiement) ; une page qui ne s'adresse qu'aux apprenants. |
| **Contraintes d'accès** | Tendinite au poignet droit : il limite la souris et navigue au clavier dès qu'il peut. Daltonien (deutéranopie) : il confond le vert et le rouge. |
| **Sur quoi il repose** | Hypothèse assumée à partir du second public de SkillHub (« formateurs indépendants »). La contrainte daltonisme est retenue car elle est fréquente chez les hommes. À vérifier par deux entretiens de formateurs. |

**Deux décisions qu'il tranche**
1. **Tout se fait au clavier** : lien d'évitement, ordre de tabulation logique, focus toujours visible, menu qui se ferme avec Échap. Déjà en place, à contrôler au TP 4.
2. **La couleur n'est jamais seule** (WCAG 1.4.1) : un champ en erreur a une bordure plus épaisse **et** un message écrit, pas seulement du rouge. Déjà en place.

**Une idée qu'il fait abandonner**
Indiquer les places restantes d'un atelier par une pastille verte, orange ou rouge : illisible pour lui. On écrit « 3 places restantes ».

---

## User journey d'inscription — Nadia

Tâche : « Je découvre SkillHub par un lien et je m'inscris à un atelier. »

| Étape | Point de contact | Action | Attente | Douleur | Décision |
|---|---|---|---|---|---|
| **1. Découverte** | Lien partagé dans un groupe WhatsApp | Ouvre le lien sur son téléphone, en pause | Comprendre en 10 secondes si c'est pour elle | Aucune ici : l'accroche « Reprenez la main sur votre reconversion » s'adresse à elle | **On garde** l'accroche et son image légère (28 Kio) |
| **2. Exploration** | Section « Les ateliers du moment » | Fait défiler les cartes | Voir le prix et le niveau de chaque atelier | **Ni prix ni niveau sur les cartes** : impossible de comparer | Ajouter **prix, niveau et durée** sur chaque carte |
| **3. Décision** | Bouton « Réserver » d'une carte | Touche « Réserver » sur « Initiation à Git » | Arriver sur l'inscription à **cet** atelier | **Le formulaire ne sait pas quel atelier elle a choisi** : elle doit s'en souvenir | Le bouton transmet l'atelier ; le formulaire l'affiche et le **pré-sélectionne** (heuristique 6) |
| **4. Inscription** | Formulaire « Créer mon compte » | Remplit ses 4 champs au pouce | Finir en moins d'une minute | **La case « J'accepte les conditions » ne mène à aucune condition** : elle accepte à l'aveugle, ou abandonne | Ajouter un **lien vers les conditions**, qui s'ouvre sans perdre la saisie (heuristique 3) |
| **5. Envoi** | Bouton « Créer mon compte » | Touche le bouton en 4G lente | Savoir que ça a marché | **Rien ne bouge pendant l'envoi** : elle touche deux ou trois fois | Le bouton passe à « Inscription en cours… » et se désactive (heuristique 1) |
| **6. Confirmation** | Message sur la page, puis courriel | Lit la confirmation | Savoir quand et où a lieu l'atelier | **Le message ne rappelle ni l'atelier, ni la date, ni la suite** | Le message et le courriel reprennent l'atelier, la date, le lien de connexion et comment annuler |

**Cinq douleurs, cinq décisions.** Le creux du parcours est aux étapes 2 et 3 : c'est là qu'on perd Nadia, donc là qu'on travaille en premier.

---

## Ce que le parcours condamne dans la page actuelle (matière du TP 3)

Relecture de la landing page de FM01 avec les deux personas :

| # | Ce qui est condamné | Qui le condamne | Heuristique de Nielsen |
|---|---|---|---|
| 1 | Cartes d'atelier **sans prix ni niveau** | Nadia (étape 2) | 6 — reconnaître plutôt que se souvenir |
| 2 | Bouton « Réserver » qui **perd l'atelier choisi** | Nadia (étape 3) | 6 — reconnaître plutôt que se souvenir |
| 3 | Case « J'accepte les conditions » **sans lien vers les conditions** | Nadia (étape 4) | 3 — contrôle et liberté ; 10 — aide |
| 4 | Bouton d'envoi **sans état « en cours »** | Nadia (étape 5) | 1 — visibilité de l'état du système |
| 5 | Confirmation **sans détail ni suite** | Nadia (étape 6) | 1 et 9 |
| 6 | **Rien pour les formateurs** : la page ne leur parle pas, sauf une option du menu « Je suis » | Julien | 2 — correspondance avec le monde réel |

**Ce que la page fait déjà bien, et qu'on garde :** l'accroche qui dit à qui s'adresse le service, les messages d'erreur écrits en clair et conservant la saisie, la navigation au clavier, les contrastes (tous mesurés au-dessus de 4,5:1, voir `fm02-contrastes.md`).
