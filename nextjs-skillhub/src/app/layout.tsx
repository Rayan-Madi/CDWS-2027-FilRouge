import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Fournisseurs } from "@/components/Fournisseurs";
import { IconeLogo } from "@/components/icones";
import { Navigation } from "@/components/Navigation";
import { SuiviDeNavigation } from "@/components/SuiviDeNavigation";
import { CHEMINS } from "@/utils/chemins";
import "./globals.css";

// Sora, auto-hébergée comme en FM01 : next/font la précharge et calcule une police de repli aux mêmes
// mesures, ce que le TP 3 faisait à la main dans index.html (plus de texte qui saute au chargement)
const sora = localFont({
  src: [
    { path: "./polices/sora-400.woff2", weight: "400", style: "normal" },
    { path: "./polices/sora-600.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-sora",
});

// Le titre de l'onglet : TitreDeVue le posait dans un effet, metadata l'écrit dans le HTML
export const metadata: Metadata = {
  title: { template: "%s · SkillHub", default: "SkillHub – apprendre avec un formateur indépendant" },
  description: "SkillHub met en relation des apprenants en reconversion et des formateurs indépendants, autour d'ateliers courts et concrets.",
  icons: { icon: "/favicon.svg" },
};

/** Le Layout de Vite devenu layout.tsx : il enveloppe toutes les pages et garde son état à la navigation. */
export default function RacineDuSite({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={sora.variable}>
      <body>
        <Fournisseurs>
          <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
            <a href="#contenu" className="absolute -top-16 left-4 z-20 rounded-m border-2 border-accent bg-fond px-4 py-2 focus:top-4">
              Aller au contenu
            </a>
            <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bordure bg-white/95 px-4 py-3 md:px-8 lg:px-[max(2rem,calc((100%-72rem)/2))]">
              <Link href={CHEMINS.accueil} className="inline-flex items-center gap-2 text-m font-semibold text-texte no-underline">
                <IconeLogo />
                SkillHub
              </Link>
              <Navigation />
            </header>
            <main id="contenu" tabIndex={-1} className="focus:outline-none">
              {children}
            </main>
            <footer className="bg-texte px-4 py-8 text-center text-pied-texte">
              <ul role="list" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <li><Link href={CHEMINS.ateliers} className="inline-block py-2 text-white focus-visible:outline-white">Ateliers</Link></li>
                <li><Link href={CHEMINS.formateurs} className="inline-block py-2 text-white focus-visible:outline-white">Formateurs</Link></li>
                <li><Link href={CHEMINS.inscription} className="inline-block py-2 text-white focus-visible:outline-white">S'inscrire</Link></li>
              </ul>
              {/* Pas d'année calculée : new Date() est interdit pendant le prérendu (Cache Components) */}
              <p className="mt-4">SkillHub · IMIE Paris · projet pédagogique · promotion CDWFS 2027</p>
            </footer>
          </div>
          <SuiviDeNavigation />
        </Fournisseurs>
      </body>
    </html>
  );
}
