import { image, type Formateur } from "../services/formateurs";

/** Un formateur : photo en trois largeurs (comme FM01), nom, rôle, citation. */
export function CarteFormateur({ formateur }: { formateur: Formateur }) {
  const photo = (largeur: number) => image(`${formateur.photo}-${largeur}.webp`);
  return (
    <article className="h-full rounded-m border border-bordure bg-fond p-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- trois largeurs WebP déjà produites (FM01) */}
      <img
        src={photo(192)}
        srcSet={`${photo(96)} 96w, ${photo(192)} 192w, ${photo(288)} 288w`}
        sizes="6rem"
        width={192}
        height={192}
        alt={`${formateur.nom}, ${formateur.role.toLowerCase()}`}
        loading="lazy"
        decoding="async"
        className="mx-auto mb-4 size-24 rounded-full object-cover"
      />
      <h2 className="text-m leading-titre font-semibold">{formateur.nom}</h2>
      <p className="text-texte-doux">{formateur.role}</p>
      <blockquote className="mt-4 italic">
        <p>{formateur.citation}</p>
      </blockquote>
    </article>
  );
}
