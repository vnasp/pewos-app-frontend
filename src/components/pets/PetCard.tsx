import { ChevronRight, Dog, Soup } from "lucide-react";
import { Link } from "react-router";

import { preloadOn } from "../../routes";

import { archiveReasonSummary } from "../../constants/labels";
import type { Pet } from "../../types";
import { ageInYears, formatShortDate } from "../../utils/date";
import PetPhoto from "./PetPhoto";

interface PetCardProps {
  pet: Pet;
  /** Sin permiso de escritura la tarjeta informa, pero no lleva a editar. */
  canWrite: boolean;
}

function PetCard({ pet, canWrite }: PetCardProps) {
  const age = ageInYears(pet.birth_date);
  const archived = pet.archived_on !== null;

  const details = (
    <>
      <div
        className={`w-20 h-20 bg-canvas rounded-xl overflow-hidden shrink-0 ${archived ? "grayscale" : ""}`}
      >
        <PetPhoto
          url={pet.photo_url}
          alt={pet.name}
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <Dog size={32} strokeWidth={1.5} className="text-subtle" aria-hidden />
            </div>
          }
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-ink text-xl font-bold mb-0.5 truncate">{pet.name}</p>
        <p className="text-muted text-sm mb-1">{pet.breed ?? ""}</p>
        <div className="flex items-center gap-2 text-subtle text-sm flex-wrap">
          {age !== null && (
            <>
              <span>{age} años</span>
              <span>•</span>
            </>
          )}
          <span>{pet.gender === "male" ? "Macho" : "Hembra"}</span>
          {pet.neutered && (
            <>
              <span>•</span>
              <span>{pet.gender === "male" ? "Castrado" : "Esterilizada"}</span>
            </>
          )}
        </div>
        {pet.weight_kg && (
          <p className="text-subtle text-sm mt-1">
            {pet.weight_kg} kg
            {pet.weight_recorded_on && ` · ${formatShortDate(pet.weight_recorded_on)}`}
          </p>
        )}
        {archived && pet.archived_reason && pet.archived_on && (
          <p className="text-subtle text-sm mt-1 font-medium">
            {archiveReasonSummary[pet.archived_reason]}{" "}
            {formatShortDate(pet.archived_on)}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`bg-white rounded-2xl shadow-card overflow-hidden ${archived ? "opacity-75" : ""}`}
    >
      {/* La tarjeta entera lleva a editar, y eliminar vive dentro de esa vista: un botón
          rojo permanente acá era ruido y un toque accidental esperando a pasar. */}
      {canWrite ? (
        <Link
          to={`/mascotas/${pet.id}`}
          className="flex gap-4 p-4 text-start active:bg-canvas transition-colors"
        >
          {details}
          <ChevronRight
            size={18}
            className="text-subtle shrink-0 self-center"
            aria-hidden
          />
        </Link>
      ) : (
        <div className="flex gap-4 p-4">{details}</div>
      )}

      {/* Una fila de acceso y no un botón con borde: es un atajo lateral, no la acción
          principal de la tarjeta, y como botón dominaba sobre los datos de la mascota.
          Archivada no la lleva: ya no hay comidas que programarle. */}
      {!archived && (
      <Link
        to={`/mascotas/${pet.id}/horarios`}
        {...preloadOn("/mascotas/:id/horarios")}
        className="flex items-center gap-2 border-t border-line px-4 py-3 active:bg-canvas transition-colors"
      >
        <Soup size={16} className="text-subtle shrink-0" aria-hidden />
        <span className="text-muted font-semibold text-sm flex-1">Horarios de comida</span>
        <ChevronRight size={16} className="text-subtle shrink-0" aria-hidden />
      </Link>
      )}
    </div>
  );
}

export default PetCard;
