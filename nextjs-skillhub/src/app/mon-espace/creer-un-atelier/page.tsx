import type { Metadata } from "next";
import { CreerAtelier } from "@/components/CreerAtelier";

export const metadata: Metadata = { title: "Créer un atelier" };

export default function PageCreerAtelier() {
  return <CreerAtelier />;
}
