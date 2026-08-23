import { PawPrint } from "lucide-react";

import type { Pet } from "../../types";
import Chip from "../ui/Chip";
import { FieldGroup } from "../ui/Field";
import PetPhoto from "./PetPhoto";

interface PetPickerProps {
  pets: Pet[];
  value: string;
  onChange: (petId: string) => void;
}

/**
 * A qué mascota pertenece lo que se está creando.
 *
 * Los mismos chips con foto que los horarios de comida: cada formulario lo dibujaba a su
 * manera —botones índigo sin foto— y la mascota es justo el dato que conviene reconocer
 * de un vistazo antes de guardar.
 *
 * Con una sola mascota no se muestra: no hay nada que elegir, y el llamador ya la trae
 * seleccionada por defecto.
 */
function PetPicker({ pets, value, onChange }: PetPickerProps) {
  if (pets.length < 2) return null;

  return (
    <FieldGroup label="Mascota">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
        {pets.map((pet) => (
          <Chip
            key={pet.id}
            active={pet.id === value}
            onClick={() => onChange(pet.id)}
            leading={
              <PetPhoto
                url={pet.photo_url}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
                fallback={<PawPrint size={14} aria-hidden />}
              />
            }
          >
            {pet.name}
          </Chip>
        ))}
      </div>
    </FieldGroup>
  );
}

export default PetPicker;
