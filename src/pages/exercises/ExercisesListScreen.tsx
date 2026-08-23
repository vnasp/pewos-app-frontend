import {
  Dumbbell,
  Clock,
  Repeat,
  Bell,
  Timer,
  Dog,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { exerciseTypeLabels } from "../../constants/labels";
import { daysUntil, shortTime } from "../../utils/date";
import { useExercises, usePets } from "../../hooks/queries";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import { useAuth } from "../../context/AuthContext";

function ExercisesListScreen() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { items: exercises, remove, update } = useExercises();
  const { items: pets } = usePets();
  const [showFinished, setShowFinished] = useState(false);

  const [toDelete, setToDelete] = useState<{ id: string; petName: string } | null>(
    null,
  );

  const handleDelete = (id: string, petName: string) => setToDelete({ id, petName });

  const isFinished = (e: (typeof exercises)[number]) =>
    !e.is_permanent && daysUntil(e.end_date) < 0;

  const finishedCount = exercises.filter(isFinished).length;

  const visibleExercises = showFinished
    ? exercises
    : exercises.filter((e) => !isFinished(e));

  const byPet = pets.map((pet) => ({
    pet,
    exs: visibleExercises.filter((e) => e.pet_id === pet.id),
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {finishedCount > 0 && (
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-ink font-bold text-base">
            {visibleExercises.length} rutina
            {visibleExercises.length !== 1 ? "s" : ""}
          </h2>
          <button
            onClick={() => setShowFinished((v) => !v)}
            className="flex items-center gap-1 text-xs text-subtle hover:text-muted transition-colors"
          >
            {showFinished ? (
              <>
                <EyeOff size={14} />
                <span>Ocultar finalizados</span>
              </>
            ) : (
              <>
                <Eye size={14} />
                <span>
                  {finishedCount} finalizado{finishedCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="px-5 pt-5">
        {pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-subtle">
            <Dog size={64} strokeWidth={1.5} />
            <p className="mt-4 text-base text-subtle text-center">
              Primero agrega una mascota
            </p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-subtle">
            <Dumbbell size={64} strokeWidth={1.5} />
            <p className="mt-4 text-base text-subtle text-center">
              No hay rutinas de ejercicio
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {byPet.map(({ pet, exs }) =>
              exs.length === 0 ? null : (
                <div key={pet.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Dog size={22} className="text-ink" />
                    <span className="text-ink text-lg font-bold">
                      {pet.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {exs.map((ex) => (
                      <div
                        key={ex.id}
                        className={`bg-white rounded-2xl p-4 shadow-card ${!ex.is_active ? "opacity-60" : ""}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className="w-12 h-12 bg-exercise-soft rounded-xl flex items-center justify-center shrink-0"
                          >
                            <Dumbbell size={22} className="text-exercise" aria-hidden />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-ink text-base font-bold mb-1">
                              {ex.type === "otro" && ex.custom_type_description
                                ? ex.custom_type_description
                                : exerciseTypeLabels[ex.type]}
                            </p>
                            <div className="flex items-center gap-1 mb-1">
                              <Timer size={13} className="text-subtle" />
                              <span className="text-muted text-sm">
                                {ex.duration_minutes} minutos
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <Repeat size={13} className="text-subtle" />
                              <span className="text-muted text-xs">
                                {ex.times_per_day}{" "}
                                {ex.times_per_day === 1 ? "vez" : "veces"} al día
                              </span>
                            </div>
                            {ex.scheduled_times.length > 0 && (
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={13} className="text-subtle" />
                                <span className="text-subtle text-xs">
                                  {ex.scheduled_times.map(shortTime).join(", ")}
                                </span>
                              </div>
                            )}
                            {ex.notification_time &&
                              ex.notification_time !== "none" && (
                                <div className="flex items-center gap-1">
                                  <Bell size={13} className="text-subtle" />
                                  <span className="text-subtle text-xs">
                                    {ex.notification_time}
                                  </span>
                                </div>
                              )}
                            {ex.notes && (
                              <p className="text-subtle text-xs mt-2">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                          {canWrite && (
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => navigate(`/ajustes/ejercicios/${ex.id}`)}
                                className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Pencil size={15} className="text-brand" />
                              </button>
                              <button
                                onClick={() => handleDelete(ex.id, pet.name)}
                                className="w-9 h-9 bg-danger-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Trash2 size={15} className="text-danger" />
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Toggle */}
                        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                          <span className="text-muted text-sm">Activo</span>
                          <button
                            onClick={() => update.mutate({ id: ex.id, data: { ...ex, is_active: !ex.is_active } })}
                            disabled={!canWrite}
                            className={`w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${ex.is_active ? "bg-success" : "bg-subtle/40"}`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${ex.is_active ? "translate-x-5" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <ConfirmSheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        title={`¿Eliminar esta rutina de ${toDelete?.petName ?? "la mascota"}?`}
        description="Se borrará también el registro de las veces que se marcó como completado. No se puede deshacer."
        confirmLabel="Eliminar"
      />
    </div>
  );
}

export default ExercisesListScreen;
