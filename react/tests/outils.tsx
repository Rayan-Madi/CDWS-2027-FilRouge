import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate, type NavigateFunction } from "react-router";
import { vi } from "vitest";
import ateliers from "../src/donnees/ateliers.json";
import { FournisseurAteliersCrees } from "../src/contexts/AteliersCrees";
import { FournisseurCompte } from "../src/contexts/Compte";
import { FournisseurInscriptions } from "../src/contexts/Inscriptions";
import { RoutesSkillHub } from "../src/router/routes";
import type { Profil } from "../src/types";

export { ateliers };

// La « barre d'adresse » des tests : MemoryRouter n'en a pas, on garde sa fonction navigate
let aller: NavigateFunction | undefined;
function BarreDAdresse() {
  const naviguer = useNavigate();
  useEffect(() => {
    aller = naviguer;
  }, [naviguer]);
  return null;
}

/** Comme taper une adresse, mais sans recharger : le compte créé pendant le test est conservé. */
export async function taperLAdresse(adresse: string) {
  await act(async () => {
    await aller?.(adresse);
  });
}

/** Toute l'application, à une adresse donnée : les vraies routes, sous un MemoryRouter. */
export function rendreA(adresse: string) {
  return render(
    <MemoryRouter initialEntries={[adresse]}>
      <FournisseurCompte>
        <FournisseurAteliersCrees>
          <FournisseurInscriptions>
            <RoutesSkillHub />
            <BarreDAdresse />
          </FournisseurInscriptions>
        </FournisseurAteliersCrees>
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

/** Remplit « Créer mon compte » (la vue doit être affichée), puis attend la bienvenue. Une adresse par test : le serveur simulé s'en souvient. */
export async function creerUnCompte(nom: string, courriel: string, profil: Profil) {
  await userEvent.type(screen.getByLabelText("Prénom et nom"), nom);
  await userEvent.type(screen.getByLabelText("Adresse électronique"), courriel);
  await userEvent.selectOptions(screen.getByLabelText("Je suis"), profil);
  await userEvent.click(screen.getByLabelText("J'accepte les conditions d'utilisation"));
  await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
  await screen.findByText("Votre compte est créé. Bienvenue !", undefined, { timeout: 3000 });
}
