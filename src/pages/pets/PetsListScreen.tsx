import { Clock, Dog, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { usePets } from "../../hooks/queries";
import { ageInYears } from "../../utils/date";

function PetsListScreen() {
  const navigate = useNavigate();
  const { items: pets, isLoading, remove } = usePets();
  const { canWrite } = useAuth();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name}?`)) remove.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6">
      {pets.length === 0 ? (
        <EmptyState
          icon={Dog}
          title="No tienes mascotas registradas"
          description={
            canWrite
              ? "Toca + para agregar tu primera mascota"
              : "Tu acceso a este grupo es de solo lectura"
          }
        />
      ) : (
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => {
            const age = ageInYears(pet.birth_date);
            return (
              <div key={pet.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                    {pet.photo_url ? (
                      <img
                        src={pet.photo_url}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dog
                          size={32}
                          strokeWidth={1.5}
                          className="text-subtle"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-xl font-bold mb-0.5 truncate">
                      {pet.name}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">{pet.breed ?? ""}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm flex-wrap">
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
                  </div>

                  {canWrite && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/mascotas/${pet.id}`)}
                        className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Pencil size={16} className="text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(pet.id, pet.name)}
                        className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-2">
                    Opciones
                  </p>
                  <button
                    onClick={() => navigate("/ajustes/horarios")}
                    className="w-full border-2 border-indigo-600 rounded-xl py-2 flex items-center justify-center gap-2 active:bg-indigo-50 transition-colors"
                  >
                    <Clock size={18} className="text-indigo-600" />
                    <span className="text-indigo-600 font-semibold text-sm">
                      Horarios de Comida
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PetsListScreen;
