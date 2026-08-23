import {
  Pill,
  Clock,
  Calendar,
  Bell,
  Infinity as InfinityIcon,
  AlertTriangle,
  CheckCircle,
  X,
  Dog,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useMedications, usePets } from "../../hooks/queries";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import { useAuth } from "../../context/AuthContext";
import { daysUntil, formatShortDate, shortTime } from "../../utils/date";

function MedicationsListScreen() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { items: medications, remove, update } = useMedications();
  const { items: pets } = usePets();
  const [showFinished, setShowFinished] = useState(false);

  const [toDelete, setToDelete] = useState<{
    id: string;
    name: string;
    petName: string;
  } | null>(null);

  const handleDelete = (id: string, petName: string, name: string) =>
    setToDelete({ id, name, petName });

  const finishedCount = medications.filter((m) => {
    const isContinuous = m.duration_days === 0;
    const days = daysUntil(m.end_date);
    return !isContinuous && days < 0;
  }).length;

  const visibleMedications = showFinished
    ? medications
    : medications.filter((m) => {
        const isContinuous = m.duration_days === 0;
        const days = daysUntil(m.end_date);
        return isContinuous || days >= 0;
      });

  const byPet = pets.map((pet) => ({
    pet,
    meds: visibleMedications.filter((m) => m.pet_id === pet.id),
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {finishedCount > 0 && (
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-ink font-bold text-base">
            {visibleMedications.length} medicamento
            {visibleMedications.length !== 1 ? "s" : ""}
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
        ) : medications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-subtle">
            <Pill size={64} strokeWidth={1.5} />
            <p className="mt-4 text-base text-subtle text-center">
              No hay medicamentos registrados
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {byPet.map(({ pet, meds }) =>
              meds.length === 0 ? null : (
                <div key={pet.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Dog size={22} className="text-ink" />
                    <span className="text-ink text-lg font-bold">
                      {pet.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {meds.map((med) => {
                      const isContinuous = med.duration_days === 0;
                      const days = daysUntil(med.end_date);
                      const isExpired = !isContinuous && days < 0;
                      const isEndingSoon =
                        !isContinuous && days >= 0 && days <= 3;

                      return (
                        <div
                          key={med.id}
                          className={`bg-white rounded-2xl p-4 shadow-card ${!med.is_active || isExpired ? "opacity-60" : ""}`}
                        >
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-med-soft rounded-xl flex items-center justify-center shrink-0">
                              <Pill size={22} className="text-med" aria-hidden />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-ink text-base font-bold mb-0.5">
                                {med.name}
                              </p>
                              <p className="text-muted text-sm mb-1">
                                {med.dosage}
                              </p>
                              {med.schedule_type === "hours" &&
                                med.frequency_hours && (
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock
                                      size={13}
                                      className="text-subtle"
                                    />
                                    <span className="text-muted text-xs">
                                      Cada {med.frequency_hours}h ·{" "}
                                      {med.scheduled_times.length}x al día
                                    </span>
                                  </div>
                                )}
                              {med.scheduled_times.length > 0 && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock size={13} className="text-subtle" />
                                  <span className="text-subtle text-xs">
                                    {med.scheduled_times.map(shortTime).join(", ")}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar size={13} className="text-subtle" />
                                <span className="text-muted text-xs">
                                  {formatShortDate(med.start_date)}{" "}
                                  {isContinuous || !med.end_date
                                    ? "· Continuo"
                                    : `— ${formatShortDate(med.end_date)}`}
                                </span>
                              </div>
                              {!isContinuous && !isExpired && (
                                <div className="flex items-center gap-1">
                                  {isEndingSoon ? (
                                    <AlertTriangle
                                      size={13}
                                      className="text-warning"
                                    />
                                  ) : (
                                    <CheckCircle
                                      size={13}
                                      className="text-success"
                                    />
                                  )}
                                  <span
                                    className={`text-xs font-semibold ${isEndingSoon ? "text-warning" : "text-success"}`}
                                  >
                                    {days === 0
                                      ? "Último día"
                                      : days === 1
                                        ? "1 día restante"
                                        : `${days} días restantes`}
                                  </span>
                                </div>
                              )}
                              {isContinuous && (
                                <div className="flex items-center gap-1">
                                  <InfinityIcon
                                    size={13}
                                    className="text-subtle"
                                  />
                                  <span className="text-subtle text-xs font-semibold">
                                    Tratamiento continuo
                                  </span>
                                </div>
                              )}
                              {isExpired && (
                                <div className="flex items-center gap-1">
                                  <X size={13} className="text-danger" />
                                  <span className="text-danger text-xs font-semibold">
                                    Tratamiento finalizado
                                  </span>
                                </div>
                              )}
                              {med.notification_time &&
                                med.notification_time !== "none" && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Bell
                                      size={13}
                                      className="text-subtle"
                                    />
                                    <span className="text-subtle text-xs">
                                      {med.notification_time}
                                    </span>
                                  </div>
                                )}
                            </div>
                            {canWrite && (
                              <div className="flex flex-col gap-2 shrink-0">
                                <button
                                  onClick={() => navigate(`/ajustes/medicamentos/${med.id}`)}
                                  className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                                >
                                  <Pencil size={15} className="text-brand" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(med.id, pet.name, med.name)
                                  }
                                  className="w-9 h-9 bg-danger-soft rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                                >
                                  <Trash2 size={15} className="text-danger" />
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Toggle activo */}
                          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                            <span className="text-muted text-sm">
                              Activo
                            </span>
                            <button
                              onClick={() => update.mutate({ id: med.id, data: { ...med, is_active: !med.is_active } })}
                              disabled={!canWrite}
                              className={`w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${med.is_active ? "bg-success" : "bg-subtle/40"}`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${med.is_active ? "translate-x-5" : "translate-x-0"}`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
        title={`¿Eliminar ${toDelete?.name ?? "este medicamento"}?`}
        description={`${toDelete?.petName ? `Es de ${toDelete.petName}. ` : ""}Se borrará también el registro de las veces que se marcó como completado. No se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </div>
  );
}

export default MedicationsListScreen;
