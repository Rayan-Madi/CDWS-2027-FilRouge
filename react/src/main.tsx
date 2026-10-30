import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Application } from "./Application";
import "./index.css";

const racine = document.getElementById("racine");
if (!racine) throw new Error("SkillHub : l'élément #racine manque dans index.html.");

createRoot(racine).render(
  <StrictMode>
    <Application />
  </StrictMode>
);
