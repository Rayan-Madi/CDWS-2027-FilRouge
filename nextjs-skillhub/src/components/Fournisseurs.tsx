"use client";

import type { ReactNode } from "react";
import { FournisseurAteliersCrees } from "../contexts/AteliersCrees";
import { FournisseurCompte } from "../contexts/Compte";
import { FournisseurInscriptions } from "../contexts/Inscriptions";

/** Les contextes ne vivent que côté client : leurs fournisseurs, réunis ici, sont posés par layout.tsx. */
export function Fournisseurs({ children }: { children: ReactNode }) {
  return (
    <FournisseurCompte>
      <FournisseurAteliersCrees>
        <FournisseurInscriptions>{children}</FournisseurInscriptions>
      </FournisseurAteliersCrees>
    </FournisseurCompte>
  );
}
