// @ts-check
/* ==========================================================================
   SkillHub — correctif du prototype (02/10/2026)
   Relevé sur téléphone : dans le parcours de Jonny, l'écran « Réservation en cours… » restait affiché.
   Cause : il était ouvert en superposition remplacée (« Swap overlay »), et dans ce cas Figma ne déclenche
   pas son « After delay » (bug connu, signalé sur le forum de Figma). Les écrans de modale portent déjà leur
   voile : on les relie donc comme de vrais écrans, par « Naviguer vers ».
   Ce que fait le correctif, sur la page « 3 · Parcours de Jonny » seulement :
     - « Open overlay » et « Swap overlay » deviennent « Naviguer vers » (même destination, même transition) ;
     - « Fermer la superposition » (Fermer, Annuler) devient « Naviguer vers » la Landing 360.
   Les déclencheurs ne changent pas. Relancé, il ne modifie plus rien.
   ========================================================================== */

/** @type {Transition} */
const FONDU = { type: "DISSOLVE", easing: { type: "EASE_OUT" }, duration: 0.3 };

async function corriger() {
  const page = figma.root.children.find((p) => p.name.startsWith("3 ·"));
  if (!page) {
    figma.closePlugin("SkillHub : page « 3 · Parcours de Jonny » introuvable. Rien n'a été modifié.");
    return { corriges: 0 };
  }
  await figma.setCurrentPageAsync(page);
  const landing = page.children.find((n) => n.name === "Landing 360");
  if (!landing) {
    figma.closePlugin("SkillHub : écran « Landing 360 » introuvable. Rien n'a été modifié.");
    return { corriges: 0 };
  }

  let corriges = 0;
  const avecLiens = page.findAll((n) => "reactions" in n && n.reactions.length > 0);
  for (const noeud of avecLiens) {
    const n = /** @type {FrameNode} */ (noeud);
    let change = false;
    /** @type {Reaction[]} */
    const nouvelles = n.reactions.map((r) => ({
      trigger: r.trigger,
      actions: (r.actions || []).map((a) => {
        if (a.type === "CLOSE") {
          change = true;
          return /** @type {Action} */ ({ type: "NODE", destinationId: landing.id, navigation: "NAVIGATE", transition: FONDU, preserveScrollPosition: false });
        }
        if (a.type === "NODE" && (a.navigation === "OVERLAY" || a.navigation === "SWAP")) {
          change = true;
          return /** @type {Action} */ ({ type: "NODE", destinationId: a.destinationId, navigation: "NAVIGATE", transition: a.transition, preserveScrollPosition: false });
        }
        return a;
      }),
    }));
    if (change) {
      await n.setReactionsAsync(nouvelles);
      corriges++;
    }
  }

  figma.closePlugin(
    corriges === 0
      ? "SkillHub : aucun lien à corriger, le prototype est déjà à jour."
      : `SkillHub : ${corriges} lien${corriges > 1 ? "s" : ""} corrigé${corriges > 1 ? "s" : ""}. Rejoue le prototype : l'envoi passe seul à la confirmation.`
  );
  return { corriges };
}

// Sous Node (tests), on exporte ; dans Figma, module n'existe pas et on corrige.
// @ts-ignore — module n'est déclaré que sous Node
if (typeof module !== "undefined") module.exports = { corriger };
else corriger();
