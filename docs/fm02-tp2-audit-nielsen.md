# FM02 · TP 2 — Audit heuristique d'une plateforme de formation

> Pas mon projet : une plateforme réelle, **différente pour chaque personne de la promotion**. Grille à remplir en naviguant moi-même.

**Plateforme auditée :** _à choisir (exemples : OpenClassrooms, Udemy, Coursera, FUN MOOC, France Travail – « Se former ») — vérifier qu'aucun camarade ne l'a déjà prise_
**Date de l'audit :** _jj/mm/2026_ · **Appareil :** _ordinateur / téléphone, navigateur_

## Les deux tâches auditées
1. _« Trouver une formation courte sur … »_
2. _« Comprendre le prix et les prérequis de cette formation »_

Méthode (cours, 2.4) : **un premier passage sans rien noter**, puis un second en relevant. Une ligne par heuristique, avec la preuve (capture dans `docs/audit/` ou citation exacte).

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
| 1 | Visibilité de l'état du système | | | |
| 2 | Correspondance avec le monde réel | | | |
| 3 | Contrôle et liberté | | | |
| 4 | Cohérence et standards | | | |
| 5 | Prévention des erreurs | | | |
| 6 | Reconnaître plutôt que se souvenir | | | |
| 7 | Souplesse et efficacité | | | |
| 8 | Design esthétique et minimaliste | | | |
| 9 | Reconnaître, diagnostiquer, réparer les erreurs | | | |
| 10 | Aide et documentation | | | |

**Où chercher, heuristique par heuristique** (des pistes, pas des réponses) :
- **1** : après un clic sur « S'inscrire » ou « Ajouter au panier », que se passe-t-il ? Y a-t-il un indicateur de chargement ?
- **2** : le vocabulaire est-il celui d'un débutant, ou celui du métier (« parcours certifiant », « RNCP », « CPF ») sans explication ?
- **3** : peut-on annuler une inscription, revenir en arrière dans un tunnel, fermer une fenêtre surgissante ?
- **5** : le formulaire refuse-t-il une saisie **après** l'envoi, sans avoir annoncé la règle avant ?
- **6** : le prix et la durée sont-ils visibles dans la liste, ou seulement sur la fiche ?
- **9** : provoque une erreur exprès (adresse mal écrite, mot de passe trop court) : le message dit-il quoi faire ?

## Les trois problèmes les plus sévères, et une recommandation vérifiable pour chacun

« Vérifiable » : ce qu'on doit **voir** après la correction, pas « améliorer la clarté ».

| Problème | Recommandation vérifiable |
|---|---|
| 1. | _ex. : « Le prix figure sur chaque carte de la liste de résultats, sans clic. »_ |
| 2. | |
| 3. | |

## Le défaut que je partage avec eux

_Le problème trouvé chez eux et qui existe aussi dans SkillHub. C'est celui qu'on corrige ensuite._

> Pour mémoire, ce que SkillHub corrigeait déjà, et que tu peux comparer : prix et niveau sur la carte (heuristique 6), atelier repris dans la modale (6), bouton « … en cours » (1), messages d'erreur qui disent quoi faire (9), conditions lisibles avant d'accepter (3 et 10).
