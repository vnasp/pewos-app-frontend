import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PawPrint, Pencil, Soup, Trash2, Plus, Save, X } from "lucide-react";
import TipCard from "../../components/settings/TipCard";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import EmptyState from "../../components/ui/EmptyState";
import PetPhoto from "../../components/pets/PetPhoto";
import type { MealTime } from "../../types";
import { useMealTimes, useMedications, usePets } from "../../hooks/queries";
import { shortTime } from "../../utils/date";

function MealTimesSettingsScreen() {
  // La mascota va en la ruta y no en un parámetro de búsqueda: los horarios son suyos,
  // así que el enlace tiene que seguir significando lo mismo al compartirlo.
  const { id: petId } = useParams();
  const navigate = useNavigate();
  const { active: pets } = usePets();
  const selectedPet = pets.find((pet) => pet.id === petId);

  const { items: mealTimes, create, update, remove } = useMealTimes(petId);
  const { items: medications } = useMedications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (meal: MealTime) => {
    setEditingId(meal.id);
    setEditName(meal.name);
    setEditTime(shortTime(meal.time));
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }
    const meal = mealTimes.find((m) => m.id === editingId);
    if (!meal) return;
    await update.mutateAsync({
      id: editingId!,
      data: { name: editName.trim(), time: editTime },
    });
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }
    await create.mutateAsync({ name: newName.trim(), time: newTime });
    setNewName("");
    setNewTime("12:00");
    setIsAdding(false);
    setError(null);
  };

  // Ya no se exige un mínimo: al quitar los tres horarios por defecto, una mascota que
  // todavía no tiene ninguno es un estado normal, no un error.
  const [mealToDelete, setMealToDelete] = useState<MealTime | null>(null);

  /**
   * Cuántos medicamentos quedan desprogramados al borrar este horario.
   *
   * La FK es `ON DELETE CASCADE`, así que se desenganchan solos y en silencio. Contarlos
   * antes es lo único que convierte eso en una decisión informada.
   */
  const affectedCount = (meal: MealTime) =>
    medications.filter((m) => m.meal_time_ids?.includes(meal.id)).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-5 lg:max-w-3xl lg:mx-auto lg:w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900 font-bold text-lg">Horarios de comida</h2>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setError(null);
            }}
            className="flex items-center gap-1 bg-brand-gradient text-white px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform"
          >
            <Plus size={16} />
            Agregar
          </button>
        )}
      </div>

      {/* Cada mascota come a sus horas: un cachorro y un perro adulto no comparten pauta. */}
      {pets.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5">
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              active={pet.id === petId}
              onClick={() => navigate(`/mascotas/${pet.id}/horarios`, { replace: true })}
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

      {error && (
        <p className="text-danger text-sm mb-3 bg-danger-soft rounded-2xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Form nueva comida */}
      {isAdding && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 ring-2 ring-brand/20">
          <p className="text-ink font-bold mb-3">Nueva comida</p>
          <label className="text-muted text-xs font-bold block mb-1">
            Nombre
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Merienda"
            className="w-full border border-black/10 rounded-2xl px-3 py-2.5 text-ink text-sm outline-none focus:ring-2 focus:ring-brand/30 mb-3"
          />
          <label className="text-muted text-xs font-bold block mb-1">
            Hora
          </label>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full border border-black/10 rounded-2xl px-3 py-2.5 text-ink text-sm outline-none focus:ring-2 focus:ring-brand/30 mb-4"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <Button onClick={handleAdd} block leading={<Save size={16} aria-hidden />}>
                Guardar
              </Button>
            </div>
            <div className="flex-1">
              <Button
                variant="secondary"
                block
                onClick={() => {
                  setIsAdding(false);
                  setError(null);
                }}
                leading={<X size={16} aria-hidden />}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {mealTimes.map((meal) => (
          <div key={meal.id} className="bg-white rounded-2xl shadow-sm p-4">
            {editingId === meal.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-black/10 rounded-2xl px-3 py-2.5 text-ink text-sm outline-none focus:ring-2 focus:ring-brand/30 mb-2"
                />
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full border border-black/10 rounded-2xl px-3 py-2.5 text-ink text-sm outline-none focus:ring-2 focus:ring-brand/30 mb-3"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Button
                      onClick={handleSaveEdit}
                      block
                      leading={<Save size={15} aria-hidden />}
                    >
                      Guardar
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      variant="secondary"
                      block
                      onClick={() => {
                        setEditingId(null);
                        setError(null);
                      }}
                      leading={<X size={15} aria-hidden />}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Neutro a propósito: una comida no es una categoría como los
                    medicamentos o los ejercicios, es solo una hora con nombre. */}
                <div className="w-10 h-10 bg-canvas rounded-xl flex items-center justify-center shrink-0">
                  <Soup size={20} className="text-subtle" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold">{meal.name}</p>
                  <p className="text-gray-500 text-sm">{shortTime(meal.time)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Pencil size={15} className="text-brand" />
                  </button>
                  <button
                    onClick={() => setMealToDelete(meal)}
                    className="w-9 h-9 bg-danger-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Trash2 size={15} className="text-danger" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {mealTimes.length === 0 && !isAdding && (
        <EmptyState
          icon={Soup}
          title={
            selectedPet
              ? `${selectedPet.name} no tiene horarios`
              : "Sin horarios de comida"
          }
          description="Agrega los que correspondan a su edad y a su rutina."
        />
      )}

      <TipCard />

      <ConfirmSheet
        open={mealToDelete !== null}
        onClose={() => setMealToDelete(null)}
        onConfirm={() => mealToDelete && remove.mutate(mealToDelete.id)}
        title={`¿Eliminar ${mealToDelete?.name ?? "esta comida"}?`}
        description={
          mealToDelete && affectedCount(mealToDelete) > 0
            ? `${affectedCount(mealToDelete)} ${
                affectedCount(mealToDelete) === 1
                  ? "medicamento dejará de estar programado"
                  : "medicamentos dejarán de estar programados"
              } con esta comida. Tendrás que reprogramarlos a otra hora.`
            : "Ningún medicamento depende de esta comida."
        }
        confirmLabel="Eliminar"
      />
    </div>
  );
}

export default MealTimesSettingsScreen;
