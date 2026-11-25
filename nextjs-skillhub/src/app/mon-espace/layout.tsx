import type { Metadata } from "next";
import { Suspense } from "react";
import { GardeEspace } from "@/components/GardeEspace";

export const metadata: Metadata = { robots: { index: false } }; // un espace personnel n'a rien à faire dans un moteur

/** Le layout de l'espace : ses trois pages passent par le second garde. Le premier, proxy.ts, a déjà filtré. */
export default function LayoutEspace({ children }: LayoutProps<"/mon-espace">) {
  return (
    <Suspense>
      <GardeEspace>{children}</GardeEspace>
    </Suspense>
  );
}
