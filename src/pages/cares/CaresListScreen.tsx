import {
  HeartPulse,
  Clock,
  Bell,
  Timer,
  Dog,
  Pencil,
  Trash2,
  Repeat,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  careTypeLabels,
  notificationTimeLabels,
  weekDayLabels,
} from "../../constants/labels";
import { daysUntil, shortTime } from "../../utils/date";
import { useCares, usePets } from "../../hooks/queries";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import { useAuth } from "../../context/AuthContext";

function CaresListScreen() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { items: cares, remove, update } = useCares();
  const { items: pets } = usePets();
  const [showFinished, setShowFinished] = useState(false);

  const [toDelete, setToDelete] = useState<{ id: string; petName: string } | null>(
    null,
  );

  const handleDelete = (id: string, petName: string) => setToDelete({ id, petName });

  const isFinished = (c: (typeof cares)[number]) =>
    !c.is_permanent && daysUntil(c.end_date) < 0;

  const finishedCount = cares.filter(isFinished).length;

  const visibleCares = showFinished ? cares : cares.filter((c) => !isFinished(c));

  const byPet = pets.map((pet) => ({
    pet,
    items: visibleCares.filter((c) => c.pet_id === pet.id),
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {finishedCount > 0 && (
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-ink font-bold text-base">
            {visibleCares.length} cuidado{visibleCares.length !== 1 ? "s" : ""}
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
        ) : cares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-subtle">
            <HeartPulse size={64} strokeWidth={1.5} />
            <p className="mt-4 text-base text-subtle text-center">
              No hay cuidados post-operatorios
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {byPet.map(({ pet, items }) =>
              items.length === 0 ? null : (
                <div key={pet.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Dog size={22} className="text-ink" />
                    <span className="text-ink text-lg font-bold">
                      {pet.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {items.map((care) => (
                      <div
                        key={care.id}
                        className={`bg-white rounded-2xl p-4 shadow-card ${!care.is_active ? "opacity-60" : ""}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className="w-12 h-12 bg-care-soft rounded-xl flex items-center justify-center shrink-0"
                          >
                            <HeartPulse size={22} className="text-care" aria-hidden />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-ink text-base font-bold mb-1">
                              {care.type === "otro" &&
                              care.custom_type_description
                                ? care.custom_type_description
                                : careTypeLabels[care.type]}
                            </p>
                            <div className="flex items-center gap-1 mb-1">
                              <Timer size={13} className="text-subtle" />
                              <span className="text-muted text-sm">
                                {care.duration_minutes} minutos
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <Repeat size={13} className="text-subtle" />
                              <span className="text-muted text-xs">
                                {care.times_per_day}{" "}
                                {care.times_per_day === 1 ? "vez" : "veces"} al
                                día
                              </span>
                            </div>
                            {care.scheduled_times.length > 0 && (
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={13} className="text-subtle" />
                                <span className="text-subtle text-xs">
                                  {care.scheduled_times.map(shortTime).join(", ")}
                                </span>
                              </div>
                            )}
                            {care.days_of_week && care.days_of_week.length > 0 && (
                              <div className="flex items-center gap-1 mb-1">
                                <Repeat size={13} className="text-brand" />
                                <span className="text-brand text-xs">
                                  {[...care.days_of_week]
                                    .sort((a, b) => {
                                      const order = [1, 2, 3, 4, 5, 6, 0];
                                      return order.indexOf(a) - order.indexOf(b);
                                    })
                                    .map((d) => weekDayLabels[d])
                                    .join(", ")}
                                </span>
                              </div>
                            )}
                            {!care.is_permanent &&
                              care.duration_days &&
                              care.end_date && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Timer size={13} className="text-subtle" />
                                  <span className="text-subtle text-xs">
                                    {(() => {
                                      const days = daysUntil(care.end_date);
                                      if (days < 0) {
                                        const past = Math.abs(days);
                                        return `Finalizado hace ${past} ${past === 1 ? "día" : "días"}`;
                                      }
                                      if (days === 0) return "Finaliza hoy";
                                      return `Finaliza en ${days} ${days === 1 ? "día" : "días"}`;
                                    })()}
                                  </span>
                                </div>
                              )}
                            {care.notification_time &&
                              care.notification_time !== "none" && (
                                <div className="flex items-center gap-1">
                                  <Bell size={13} className="text-subtle" />
                                  <span className="text-subtle text-xs">
                                    {
                                      notificationTimeLabels[
                                        care.notification_time
                                      ]
                                    }
                                  </span>
                                </div>
                              )}
                            {care.notes && (
                              <p className="text-subtle text-xs mt-2">
                                {care.notes}
                              </p>
                            )}
                          </div>
                          {canWrite && (
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => navigate(`/ajustes/cuidados/${care.id}`)}
                                className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Pencil size={15} className="text-brand" />
                              </button>
                              <button
                                onClick={() => handleDelete(care.id, pet.name)}
                                className="w-9 h-9 bg-danger-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Trash2 size={15} className="text-danger" />
                              </button>
                              <button
                                onClick={() => update.mutate({ id: care.id, data: { ...care, is_active: !care.is_active } })}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform text-xs font-bold ${care.is_active ? "bg-success-soft text-success" : "bg-canvas text-subtle"}`}
                              >
                                {care.is_active ? "ON" : "OFF"}
                              </button>
                            </div>
                          )}
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
        title={`¿Eliminar este cuidado de ${toDelete?.petName ?? "la mascota"}?`}
        description="Se borrará también el registro de las veces que se marcó como completado. No se puede deshacer."
        confirmLabel="Eliminar"
      />
    </div>
  );
}

export default CaresListScreen;
