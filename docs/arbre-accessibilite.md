# Arbre d'accessibilité — ce que le lecteur d'écran reçoit

L'arbre d'accessibilité est la version de la page que le navigateur transmet aux technologies d'assistance : pour chaque élément, **un rôle, un nom, un état**. Relevé le 25/09/2026 sur la version du TP 4, à 375 px de large (Chrome, protocole DevTools `Accessibility.getPartialAXTree`).

| Élément | Rôle | Nom accessible | Description, états |
|---|---|---|---|
| Lien d'évitement | link | Aller au contenu | focusable=true |
| Bouton du menu (fermé) | button | Menu | invalid=false · focusable=true · expanded=false |
| Liste du menu (fermé) | none |  |  |
| Bouton du menu (ouvert) | button | Menu | invalid=false · focusable=true · expanded=true |
| Navigation principale (menu fermé) | navigation | Navigation principale |  |
| Titre de la page | heading | Reprenez la main sur votre reconversion | level=1 |
| Section « Ateliers » | region | Les ateliers du moment |  |
| Bouton « Réserver » (1er atelier) | button | Réserver l'atelier Initiation à Git | invalid=false · focusable=true |
| Photo d'une formatrice | image | Sarah Benali, développeuse web |  |
| Icône d'une valeur | none |  |  |
| Champ « Adresse électronique » | textbox | Adresse électronique | Nous ne la transmettons à personne. · invalid=false · focusable=true · required=true |
| Modale ouverte | dialog | Réserver : Initiation à Git | focusable=true · modal=true |
| Champ « Prénom et nom » en erreur (modale) | textbox | Prénom et nom | Indiquez votre prénom et votre nom. · invalid=true · focusable=true · required=true |

## Ce qu'on y lit

- **Le bouton du menu** annonce son état : `expanded=false` fermé, `expanded=true` ouvert. L'attribut suit l'affichage, il ne ment pas.
- **La navigation reste un repère** même menu fermé (`navigation`, « Navigation principale ») : seule la **liste** est retirée de l'arbre (`none`). C'est une correction de ce TP : avant, toute la `<nav>` était cachée sur mobile, et le repère disparaissait.
- **Chaque bouton « Réserver » a un nom complet** (« Réserver l'atelier Initiation à Git ») grâce au texte masqué : trois boutons, trois noms distincts.
- **La modale** est un `dialog`, `modal=true`, nommée par son titre (« Réserver : Initiation à Git ») grâce à `aria-labelledby`.
- **Un champ en erreur** porte `invalid=true`, et son message d'erreur est sa **description** : il est lu avec le champ.
- **L'aide d'un champ** est sa description (« Nous ne la transmettons à personne. »), grâce à `aria-describedby`.
- **Les icônes décoratives** sont hors de l'arbre (`none`), les **photos** ont un nom (leur `alt`).

> La capture demandée par la fiche d'épreuve se fait dans Chrome : F12 → onglet **Elements** → panneau **Accessibility**, sur un bouton « Réserver » sélectionné. À enregistrer sous `docs/arbre-accessibilite.png`.
