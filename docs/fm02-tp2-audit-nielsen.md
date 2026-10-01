# FM02 · TP 2 — Audit heuristique d'une plateforme de formation

> Pas mon projet : une plateforme réelle, **différente pour chaque personne de la promotion**. Grille remplie en naviguant sur le site.

**Plateforme auditée :** [Studi](https://www.studi.com/fr), organisme de formation 100 % en ligne tourné vers la reconversion, avec des formations éligibles au CPF. Le public est celui de Jonny et de Mélanie. *À vérifier : qu'aucun camarade ne l'a déjà prise.*
**Date de l'audit :** 01/10/2026 · **Appareil :** ordinateur, navigateur Chromium, fenêtre de 1024 px · cookies non essentiels refusés.
**Comment :** navigation menée avec un assistant de code, qui pilotait le navigateur. Les observations s'appuient sur des citations exactes et sur l'inspection du code des pages. Chaque affirmation a ensuite été contre-vérifiée sur les pages rendues (28 vérifiées : 26 confirmées, 2 corrigées). Aucun formulaire n'a été rempli ni envoyé : les données seraient parties chez l'organisme. *À rejouer moi-même avant l'oral : c'est mon regard que le jury évalue.*

## Les deux tâches auditées
1. « Trouver une formation courte sur le design d'interface (UX/UI), idéalement sur Figma. »
2. « Comprendre le prix et les prérequis de cette formation. »

Méthode (cours, 2.4) : **un premier passage sans rien noter** (les deux tâches d'un trait), puis un second en relevant. Une ligne par heuristique, avec la preuve (capture dans `docs/audit/` ou citation exacte).

**Le parcours suivi :**
- accueil → recherche « UX UI design » → domaine « Formations en ligne au Design graphique - UX/UI » → filtre « Courts (- 6 mois) » → celle dont l'intitulé parle d'interface : [« Concevoir les éléments graphiques d'une interface et de supports de communication »](https://www.studi.com/fr/formation/design-graphique-et-digital/design-graphique-interface-supports) (190 h, 3 mois) → onglet « Modalités » → bouton « Candidater » ;
- en plus : une recherche « Figma » et une recherche sans résultat (« xqzvkw »).

## Échelle de sévérité (Nielsen)

| Note | Sens | Repère |
|---|---|---|
| 0 | Pas un problème | La case existe : un audit sans aucun 0 n'a pas été fait honnêtement |
| 1 | Cosmétique | À corriger quand on passe à côté |
| 2 | Mineur | Tout le monde hésite, personne n'abandonne |
| 3 | Majeur | Bloquant pour une partie des gens, ou tâche finie au prix d'un gros effort |
| 4 | Catastrophique | La personne part et ne revient pas |

## La grille

| # | Heuristique | Ce que j'ai observé | Preuve | Sévérité |
|---|---|---|---|---|
| 1 | Visibilité de l'état du système | **Bien tenu.** Une icône de chargement tourne dans le champ pendant la recherche. Les filtres affichent leur nombre de résultats, et un filtre actif se voit : pastille « 1 », étiquette « Courts (- 6 mois) × », lien « Effacer les filtres ». Le formulaire de candidature dit où l'on en est : « COORDONNÉES · Étape 1 / 4 ». | « 8 formations sur 19 » · « Filtrer 1 » · « Etape 1 / 4 » | **0** |
| 2 | Correspondance avec le monde réel | « Court » veut dire *moins de six mois* : le filtre « Courts (- 6 mois) » regroupe 19 formations de 30 h (les « Tosa ») à 250 h. Pour Jonny, une formation courte, c'est quelques heures. Les cartes empilent le jargon de l'organisme sans l'expliquer : « Bloc de compétences », « Niveau 6 (Bac+3) », « Certificat Répertoire Spécifique », « Tosa ». | « Courts (- 6 mois) 19 » · fiche : « Certification Bloc de compétences • Niveau 6 (Bac+3) » | **2** |
| 3 | Contrôle et liberté | **Le consentement publicitaire est obligatoire pour candidater.** La case « J'accepte de recevoir des communications promotionnelles de STUDI […] et que STUDI mesure l'ouverture de ces communications à l'aide de pixels de suivi » porte l'attribut `required`, sans astérisque. Son message d'erreur prévu est « Veuillez accepter les conditions » : la publicité y passe pour des conditions d'utilisation. Qui refuse la publicité ne peut pas passer l'étape 1. Même déséquilibre à l'arrivée sur le site : une fenêtre de cookies grise la page et en bloque le défilement. « Accepter » y est un gros bouton plein, le refus un petit lien texte (« Continuer sans accepter → »). | Formulaire `/fr/form/candidature?formation=11962`, champ `#edit-rgpd` : `required`, `data-webform-required-error="Veuillez accepter les conditions"` · fenêtre de cookies de l'accueil | **3** |
| 4 | Cohérence et standards | La même formation porte trois noms : l'onglet dit « Conception graphique et UI », le titre « Concevoir les éléments graphiques d'une interface et de supports de communication », le fil d'Ariane la coupe en « Concevoir les éléments graphiq… ». Même chose pour le domaine : « Formations en ligne au Design graphique - UX/UI » dans la suggestion de recherche et le titre de l'onglet, « Design graphique et digital » dans le fil d'Ariane et le filtre « Domaine », « Formez-vous au Design Graphique » en titre. Deux verbes pour la même intention : « Nous contacter » sous chaque prix, « Candidater » en bas. | Titre de l'onglet et `<h1>` de la fiche · page domaine | **1** |
| 5 | Prévention des erreurs | Les règles sont annoncées avant la saisie : « *Informations obligatoires », un astérisque par champ requis, un sélecteur de date au format « JJ/MM/AAAA ». Petit risque : les exemples « Martin » et « Dupont », en gris clair dans les champs, peuvent passer pour une saisie déjà faite. *Erreur à l'envoi non provoquée (rien n'a été envoyé).* | Étape 1 du formulaire de candidature | **1** |
| 6 | Reconnaître plutôt que se souvenir | **Le prix n'est pas sur les cartes.** Pour comparer les 19 formations « courtes », il faut ouvrir chaque fiche, retenir le prix, revenir. Et sur la fiche, il y a trois prix (Essentiel 1 990 €, Plus 2 190 €, Premium 2 390 €). Le prix est pourtant **dans le code de chaque carte** (données schema.org : `"price": "1990"`), simplement pas affiché. Les bons points : les suggestions de recherche surlignent les mots tapés, et le formulaire rappelle en haut la formation choisie. | Carte : « ELIGIBLE CPF · 190H • 3 MOIS · BAC+3 », sans prix · fiche : « 1990 € · Nous contacter » | **3** |
| 7 | Souplesse et efficacité | Les filtres sont nombreux (domaine, format, niveau, financement, certification, partenaire) et l'adresse les garde, donc on peut partager une recherche. Mais il n'y a **ni filtre ni tri par prix ou par nombre d'heures**, précisément les deux critères de Jonny. Et 8 résultats sur 19 seulement, puis « Afficher plus de formations ». | Page domaine filtrée : adresse `?training[refinementList][field_cycle][0]=Courts (- 6 mois)` | **2** |
| 8 | Design esthétique et minimaliste | Sous la liste, un texte de référencement de plusieurs écrans, avec des coquilles (« Ect. », deux fois) et des outils datés (« Dreamweaver »). Pendant la navigation, une barre « Contactez-nous » reste collée en bas et une bulle d'aide porte une pastille « 1 ». À l'arrivée, quatre propositions de contact s'ouvrent par-dessus la page. | Page domaine : « Webdesigner / Ect. » · [`audit/studi-accueil-sollicitations.png`](audit/studi-accueil-sollicitations.png) | **1** |
| 9 | Reconnaître, diagnostiquer, réparer les erreurs | **Une recherche sans résultat échoue en silence.** Taper « Figma » n'affiche aucune suggestion et aucun message. Avec Entrée, on arrive sur le catalogue complet, « 20 formations sur 435 », champ vidé, sans que « Figma » apparaisse nulle part. Rien ne dit que la recherche n'a rien trouvé, ni quoi essayer. Même chose avec « xqzvkw ». Pourtant le site cite Figma dans le texte de sa page UX/UI (« maîtriser des logiciels tels qu'Adobe XD, Sketch ou Figma »), et des descriptions de formations, non affichées, parlent de « maquetter sur Figma ». Un message prévu pour ce cas existe même dans la configuration du site (« Pas de résultats de recherche ? … »), mais il ne s'affiche pas. | `/fr/formations?autocomplete[query]=Figma` → « 20 formations sur 435 », champ « Mot clé : Comptable, développeur » vide | **3** |
| 10 | Aide et documentation | Le « ⓘ » de la durée explique utilement : « La durée de réalisation effective peut être […] inférieure ou supérieure à la durée estimée, sans incidence sur le tarif ». Mais les financements portent des renvois **sans notes** : « Jusqu'à 100%(1) », « (2) », « (3) » ne renvoient à aucun texte sur la page. Et les prérequis se limitent à l'âge (« Être âgé(e) de 16 ans révolus ») pour une formation étiquetée « BAC+3 » : rien sur le niveau ou les logiciels à connaître. | Fiche, rubrique « Solutions de financement » · onglet « Modalités », « Conditions d'admission » | **2** |

## Les trois problèmes les plus sévères, et une recommandation vérifiable pour chacun

« Vérifiable » : ce qu'on doit **voir** après la correction, pas « améliorer la clarté ».

| Problème | Recommandation vérifiable |
|---|---|
| 1. **Recherche sans résultat silencieuse** (heuristique 9, sévérité 3) : « Figma » renvoie au catalogue complet, mot effacé, sans explication. | Une recherche sans résultat affiche « Aucune formation ne contient « Figma » », **garde le mot dans le champ**, et propose au moins une piste cliquable (le domaine « Design graphique - UX/UI », ou les formations dont le programme cite l'outil). |
| 2. **Consentement publicitaire obligatoire pour candidater** (heuristique 3, sévérité 3). | On passe à l'étape 2 du formulaire **sans cocher** la case des communications promotionnelles. Dans le bandeau de cookies, « Refuser » est un bouton de même taille et de même poids qu'« Accepter ». |
| 3. **Prix absent des cartes** (heuristique 6, sévérité 3) : impossible de comparer sans ouvrir chaque fiche, alors que le prix est déjà dans les données de chaque carte. | Chaque carte de la liste affiche « à partir de 1 990 € » (le prix de la formule de base), sans clic, et la liste se trie par prix et par nombre d'heures. |

## Le défaut que je partage avec eux

**Le niveau est affiché, les prérequis non.** Chez Studi, la formation porte « BAC+3 », mais sa seule condition d'admission est « Être âgé(e) de 16 ans révolus » : on ne sait pas si l'on peut la suivre.

SkillHub fait la même chose en plus petit. Les cartes disent « Niveau débutant », « Niveau intermédiaire » ou « Tous niveaux », et la modale le répète. Mais rien ne dit ce qu'il faut savoir avant. Jonny, qui hésite devant « Maquetter une page avec Figma — Niveau intermédiaire », ne peut pas savoir s'il suit. C'est l'heuristique 10 (et la 2 : « intermédiaire » est un mot de l'organisme, pas de l'apprenant).

**La correction à faire ensuite dans SkillHub (vérifiable) :** chaque carte d'atelier affiche une ligne « Prérequis : … » en mots concrets (par exemple « avoir déjà ouvert Figma » ou « aucun »), reprise dans le récapitulatif de la modale. Elle touchera `src/index.html`, le contenu du plugin Figma (`CONTENU.ateliers`) et la maquette.

> Pour mémoire, ce que SkillHub corrigeait déjà, et qu'on peut comparer : prix et niveau sur la carte (heuristique 6 : c'est le problème n° 3 de Studi), atelier repris dans la modale (6 : Studi le fait aussi, en haut du formulaire), bouton « … en cours » (1), messages d'erreur qui disent quoi faire (9 : le problème n° 1 de Studi), conditions lisibles avant d'accepter (3 et 10).
