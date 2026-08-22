import type { Pet } from "../../types";

interface PetFilterTabsProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
  countByPet: Record<string, number>;
}

export default function PetFilterTabs({
  pets,
  selectedPetId,
  onSelect,
  totalCount,
  countByPet,
}: PetFilterTabsProps) {
  if (pets.length <= 1) return null;

  return (
    <div className="px-5 mb-1">
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
        {/* Todas */}
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            selectedPetId === null
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          Todas
          {totalCount > 0 && (
            <span
              className={`ml-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                selectedPetId === null
                  ? "bg-white/30 text-white"
                  : "bg-indigo-200 text-indigo-800"
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>

        {pets.map((pet) => {
          const count = countByPet[pet.id] ?? 0;
          if (count === 0) return null;
          const active = selectedPetId === pet.id;
          return (
            <button
              key={pet.id}
              onClick={() => onSelect(pet.id)}
              className={`shrink-0 flex items-center gap-1.5 h-7 pe-2 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className={`w-8 h-8 rounded-full object-cover shrink-0 ring-2 ${active ? "ring-indigo-600" : "ring-indigo-100"}`}
                />
              ) : (
                <span className="text-base leading-none">🐕</span>
              )}
              {pet.name}
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  active
                    ? "bg-white/30 text-white"
                    : "bg-indigo-200 text-indigo-800"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
