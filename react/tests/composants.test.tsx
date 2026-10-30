// Les composants et les vues, sous jsdom : ce qu'on voit, ce qu'on annonce, où va le focus.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import type { Atelier } from "../src/types";
import { CarteAtelier } from "../src/components/CarteAtelier";
import { useCompte } from "../src/contexts/Compte";
import { ateliers, catalogueOk, rendreA, simulerFetch } from "./outils";

const git = ateliers[0] as Atelier;

describe("CarteAtelier : elle ne décide de rien, elle prévient", () => {
  const carte = (props: Partial<Parameters<typeof CarteAtelier>[0]> = {}) => {
    const onInscrire = vi.fn();
    render(
      <MemoryRouter>
        <CarteAtelier atelier={git} placesRestantes={git.places} inscrit={false} onInscrire={onInscrire} onDesinscrire={vi.fn()} {...props} />
      </MemoryRouter>
    );
    return onInscrire;
  };

  test("le bouton dit de quel atelier il parle, et passe l'identifiant au parent", async () => {
    const onInscrire = carte();
    await userEvent.click(screen.getByRole("button", { name: "S'inscrire à l'atelier Initiation à Git" }));
    expect(onInscrire).toHaveBeenCalledWith("git-initiation");
    expect(screen.getByRole("link", { name: "Initiation à Git" })).toHaveAttribute("href", "/ateliers/git-initiation");
  });

  test("complet : « Complet » en toutes lettres, et pas de bouton", () => {
    carte({ placesRestantes: 0 });
    expect(screen.getByText("Complet")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("inscrit : « Vous êtes inscrit » et le même bouton devient « Se désinscrire »", () => {
    carte({ inscrit: true });
    expect(screen.getByText("Vous êtes inscrit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se désinscrire de l'atelier Initiation à Git" })).toBeInTheDocument();
  });
});

describe("Catalogue : les quatre états", () => {
  test("chargement, puis succès : 14 cartes, et le compteur annoncé", async () => {
    catalogueOk();
    rendreA("/ateliers");
    expect(screen.getByRole("status")).toHaveTextContent("Chargement des ateliers…");
    expect(await screen.findByText("14 ateliers · par date")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(14);
    expect(document.title).toBe("Les ateliers · SkillHub");
  });

  test("les critères viennent de l'URL : ?niveau=avance&soir=oui", async () => {
    catalogueOk();
    rendreA("/ateliers?niveau=avance&soir=oui");
    expect(await screen.findByText("2 ateliers · niveau avancé · le soir · par date")).toBeInTheDocument();
    expect(screen.getByLabelText("Niveau")).toHaveValue("avance");
  });

  test("vide : une phrase polie, et « Tout afficher » remet tout et renvoie le focus à la recherche", async () => {
    catalogueOk();
    rendreA("/ateliers?recherche=cobol");
    expect(await screen.findByText("Aucun atelier ne correspond à ces filtres.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tout afficher" }));
    expect(await screen.findByText("14 ateliers · par date")).toBeInTheDocument();
    expect(screen.getByLabelText(/Rechercher/)).toHaveFocus();
  });

  test("erreur 404 : une phrase sans code (role=alert), « Réessayer » relance et réussit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const faux = simulerFetch(() => new Response("introuvable", { status: 404 }));
    rendreA("/ateliers");
    expect(await screen.findByRole("alert")).toHaveTextContent("Le catalogue est introuvable pour le moment.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("404");
    faux.mockImplementation(async () => new Response(JSON.stringify(ateliers), { status: 200 }));
    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("14 ateliers · par date")).toBeInTheDocument();
  });
});

describe("Routes", () => {
  test("une adresse inconnue : la page introuvable, jamais un écran blanc", () => {
    catalogueOk();
    rendreA("/nimporte-quoi");
    expect(screen.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeInTheDocument();
  });

  test("le garde : sans compte, /mon-espace mène à l'inscription", () => {
    catalogueOk();
    rendreA("/mon-espace");
    expect(screen.getByRole("heading", { level: 1, name: "Créer mon compte" })).toBeInTheDocument();
  });

  test("la fiche d'un atelier inconnu le dit, avec un lien vers le catalogue", async () => {
    catalogueOk();
    rendreA("/ateliers/existe-pas");
    expect(await screen.findByRole("heading", { level: 1, name: "Atelier introuvable" })).toBeInTheDocument();
  });
});

describe("Inscription, puis Mon espace", () => {
  test("envoi vide : un message relié à chaque champ, focus sur le premier", async () => {
    rendreA("/inscription");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    const nom = screen.getByLabelText("Prénom et nom");
    expect(nom).toHaveFocus();
    expect(nom).toHaveAttribute("aria-invalid", "true");
    expect(nom).toHaveAccessibleDescription("Indiquez votre prénom et votre nom.");
    expect(screen.getByLabelText("Adresse électronique")).toHaveAccessibleDescription(/Indiquez votre adresse électronique/);
  });

  test("compte créé : direction Mon espace, « Bonjour Jonny », et la navigation propose « Mon espace »", async () => {
    catalogueOk();
    rendreA("/inscription");
    await userEvent.type(screen.getByLabelText("Prénom et nom"), "Jonny Martin");
    await userEvent.type(screen.getByLabelText("Adresse électronique"), "jonny@exemple.fr");
    await userEvent.selectOptions(screen.getByLabelText("Je suis"), "apprenant");
    await userEvent.click(screen.getByLabelText("J'accepte les conditions d'utilisation"));
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(screen.getByRole("button", { name: "Inscription en cours…" })).toHaveAttribute("aria-disabled", "true");
    expect(await screen.findByRole("heading", { level: 1, name: "Bonjour Jonny" }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("Votre compte est créé. Bienvenue !")).toBeInTheDocument();
    expect(await screen.findByText(/aucun atelier pour l'instant/)).toBeInTheDocument();
    expect(within(screen.getByRole("navigation")).getByRole("link", { name: "Mon espace" })).toHaveAttribute("aria-current", "page");
  });
});

describe("Navigation et hooks", () => {
  test("« Menu » : aria-expanded suit, et Échap referme en rendant le focus au bouton", async () => {
    catalogueOk();
    rendreA("/");
    const menu = screen.getByRole("button", { name: "Menu" });
    await userEvent.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(menu).toHaveFocus();
  });

  test("un hook maison hors de son fournisseur le dit tout de suite", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Sonde() {
      useCompte();
      return null;
    }
    expect(() => render(<Sonde />)).toThrow("useCompte doit être appelé sous <FournisseurCompte>.");
  });
});
