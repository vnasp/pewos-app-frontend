import { PawPrint } from "lucide-react";

import type { Pet } from "../../types";
import PetPhoto from "../pets/PetPhoto";
import Chip from "../ui/Chip";

interface PetFilterTabsProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
  countByPet: Record<string, number>;
}

/** Filtro por mascota. Va sobre el degradado del header, de ahí el tono claro. */
function PetFilterTabs({
  pets,
  selectedPetId,
  onSelect,
  totalCount,
  countByPet,
}: PetFilterTabsProps) {
  // Con una sola mascota el filtro no aporta nada.
  if (pets.length <= 1) return null;

  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
      <Chip
        tone="light"
        active={selectedPetId === null}
        count={totalCount}
        onClick={() => onSelect(null)}
        leading={<PawPrint size={14} aria-hidden />}
      >
        Todas
      </Chip>

      {pets.map((pet) => {
        const count = countByPet[pet.id] ?? 0;
        if (count === 0) return null;
        return (
          <Chip
            key={pet.id}
            tone="light"
            active={selectedPetId === pet.id}
            count={count}
            onClick={() => onSelect(pet.id)}
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
        );
      })}
    </div>
  );
}

export default PetFilterTabs;
