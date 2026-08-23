import { Mail, MapPin, PawPrint, Pencil, Phone, Stethoscope, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import PetPhoto from "../../components/pets/PetPhoto";
import Chip from "../../components/ui/Chip";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import { useAuth } from "../../context/AuthContext";
import { usePets, useVeterinarians } from "../../hooks/queries";

function VeterinariansListScreen() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { items: veterinarians, remove } = useVeterinarians();
  const { items: pets } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (id: string, name: string) => setToDelete({ id, name });

  const filteredVets = selectedPetId
    ? veterinarians.filter((v) => v.pet_id === selectedPetId)
    : veterinarians;

  // Agrupar por perro
  const byPet = pets.map((pet) => ({
    pet,
    vets: filteredVets.filter((v) => v.pet_id === pet.id),
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6">
      {/* Tabs por perro */}
      {pets.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
          <Chip
            active={selectedPetId === null}
            count={veterinarians.length}
            onClick={() => setSelectedPetId(null)}
          >
            Todos
          </Chip>
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              active={selectedPetId === pet.id}
              count={veterinarians.filter((v) => v.pet_id === pet.id).length}
              onClick={() => setSelectedPetId(pet.id)}
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
      )}

      {veterinarians.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-subtle">
          <Stethoscope size={64} strokeWidth={1.5} />
          <p className="mt-4 text-lg text-subtle text-center mb-1">
            No hay veterinarios registrados
          </p>
          <p className="text-sm text-center">
            Toca + para agregar un veterinario
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {byPet.map(({ pet, vets }) =>
            vets.length === 0 ? null : (
              <div key={pet.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-ink text-lg font-bold">
                    {pet.name}
                  </span>
                </div>
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {vets.map((vet) => (
                    <div
                      key={vet.id}
                      className="bg-white rounded-2xl p-4 shadow-card"
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 bg-canvas rounded-xl flex items-center justify-center shrink-0">
                          <Stethoscope size={22} className="text-subtle" aria-hidden />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ink text-base font-bold mb-0.5 truncate">
                            {vet.name}
                          </p>
                          {vet.clinic_name && (
                            <p className="text-muted text-sm truncate">
                              {vet.clinic_name}
                            </p>
                          )}
                        </div>
                        {canWrite && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => navigate(`/veterinarios/${vet.id}`)}
                              className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            >
                              <Pencil size={16} className="text-brand" />
                            </button>
                            <button
                              onClick={() => handleDelete(vet.id, vet.name)}
                              className="w-9 h-9 bg-danger-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            >
                              <Trash2 size={16} className="text-danger" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Información de contacto */}
                      <div className="space-y-2">
                        {vet.phone && (
                          <div className="flex items-center gap-2 text-muted text-sm">
                            <Phone size={14} className="shrink-0" />
                            <a
                              href={`tel:${vet.phone}`}
                              className="truncate hover:text-brand"
                            >
                              {vet.phone}
                            </a>
                          </div>
                        )}
                        {vet.email && (
                          <div className="flex items-center gap-2 text-muted text-sm">
                            <Mail size={14} className="shrink-0" />
                            <a
                              href={`mailto:${vet.email}`}
                              className="truncate hover:text-brand"
                            >
                              {vet.email}
                            </a>
                          </div>
                        )}
                        {vet.address && (
                          <div className="flex items-center gap-2 text-muted text-sm">
                            <MapPin size={14} className="shrink-0" />
                            <span className="truncate">{vet.address}</span>
                          </div>
                        )}
                      </div>

                      {vet.notes && (
                        <p className="text-subtle text-xs mt-3 italic">
                          {vet.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <ConfirmSheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        title={`¿Eliminar a ${toDelete?.name ?? "este veterinario"}?`}
        description="Se borra su ficha de contacto. Las citas que ya registraste no se ven afectadas."
        confirmLabel="Eliminar"
      />
    </div>
  );
}

export default VeterinariansListScreen;
