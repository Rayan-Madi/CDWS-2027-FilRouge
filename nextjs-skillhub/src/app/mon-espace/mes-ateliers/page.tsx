import type { Metadata } from "next";
import { MesAteliers } from "@/components/MesAteliers";

export const metadata: Metadata = { title: "Mes ateliers" };

export default function PageMesAteliers() {
  return <MesAteliers />;
}
