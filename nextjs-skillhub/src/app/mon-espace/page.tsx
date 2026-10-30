import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";
import { catalogueEnCache } from "@/services/en-cache";

export const metadata: Metadata = { title: "Mon espace" };

/** Mon espace (Dashboard, TP 2) : le catalogue est attendu sur le serveur, les inscriptions sont lues côté client. */
export default async function PageMonEspace() {
  return <Dashboard ateliers={await catalogueEnCache()} />;
}
