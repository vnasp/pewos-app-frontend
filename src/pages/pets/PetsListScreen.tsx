import { Dog } from "lucide-react";

import PetCard from "../../components/pets/PetCard";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { usePets } from "../../hooks/queries";

const grid = "flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3";

function PetsListScreen() {
  const { items: pets, active, archived, isLoading } = usePets();
  const { canWrite } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6">
        <EmptyState
          icon={Dog}
          title="No tienes mascotas registradas"
          description={
            canWrite
              ? "Toca + para agregar tu primera mascota"
              : "Tu acceso a este grupo es de solo lectura"
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6">
      <div className={grid}>
        {active.map((pet) => (
          <PetCard key={pet.id} pet={pet} canWrite={canWrite} />
        ))}
      </div>

      {/* Abajo y bajo su propio título: siguen siendo suyas, pero ya no son la lista de
          todos los días. Con todas archivadas, esta es la única sección que queda. */}
      {archived.length > 0 && (
        <>
          <p className="text-subtle text-xs font-bold uppercase tracking-wide mt-8 mb-3">
            Ya no están contigo
          </p>
          <div className={grid}>
            {archived.map((pet) => (
              <PetCard key={pet.id} pet={pet} canWrite={canWrite} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PetsListScreen;
