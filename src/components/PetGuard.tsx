import { PawPrint, Plus } from "lucide-react";

import EmptyState from "./ui/EmptyState";

interface PetGuardProps {
  onAddPet: () => void;
  /** Un viewer no puede crear nada, así que se le explica en vez de ofrecerle el botón. */
  canWrite: boolean;
}

/**
 * Lo que se ve en lugar del contenido cuando no hay ninguna mascota registrada.
 *
 * Citas, medicamentos, ejercicios, cuidados y horarios cuelgan todos de un `pet_id`: sin
 * mascota esas pantallas no pueden listar ni crear nada. Antes mostraban un "no hay
 * recordatorios" que no decía por dónde empezar, y sus formularios llegaban a mandar un
 * `pet_id` vacío a la API.
 */
function PetGuard({ onAddPet, canWrite }: PetGuardProps) {
  return (
    <div className="flex flex-col items-center px-5">
      <EmptyState
        icon={PawPrint}
        title="Primero agrega una mascota"
        description={
          canWrite
            ? "Los recordatorios, las citas y los horarios se guardan a nombre de una mascota."
            : "Tu acceso a este grupo es de solo lectura: quien lo administra tiene que registrar la primera."
        }
      />
      {canWrite && (
        <button
          type="button"
          onClick={onAddPet}
          className="flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-base font-extrabold text-white shadow-fab transition-transform active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} aria-hidden />
          Agregar mascota
        </button>
      )}
    </div>
  );
}

export default PetGuard;
