import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import ateliers from "../src/donnees/ateliers.json";
import { FournisseurCompte } from "../src/contexts/Compte";
import { FournisseurInscriptions } from "../src/contexts/Inscriptions";
import { RoutesSkillHub } from "../src/router/routes";

export { ateliers };

/** Toute l'application, à une adresse donnée : les vraies routes, sous un MemoryRouter. */
export function rendreA(adresse: string) {
  return render(
    <MemoryRouter initialEntries={[adresse]}>
      <FournisseurCompte>
        <FournisseurInscriptions>
          <RoutesSkillHub />
        </FournisseurInscriptions>
      </FournisseurCompte>
    </MemoryRouter>
  );
}

/** Un faux fetch : une Response NEUVE à chaque appel (StrictMode double les effets, un corps ne se lit qu'une fois). */
export function simulerFetch(reponse: () => Response) {
  const faux = vi.fn(async () => reponse());
  vi.stubGlobal("fetch", faux);
  return faux;
}

export const catalogueOk = () => simulerFetch(() => new Response(JSON.stringify(ateliers), { status: 200 }));
