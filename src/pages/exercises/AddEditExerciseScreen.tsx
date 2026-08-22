import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { calculateScheduledTimes } from "../../utils/schedule";
import { formatLocalDate, parseLocalDate, shortTime, today } from "../../utils/date";
import type { ExerciseType, NotificationTime } from "../../types";
import { exerciseTypeColors, exerciseTypeLabels } from "../../constants/labels";
import { useExercises, usePets } from "../../hooks/queries";

const exerciseTypes: ExerciseType[] = [
  "caminata",
  "cavaletti",
  "balanceo",
  "slalom",
  "entrenamiento",
  "otro",
];

const notificationOptions: { value: NotificationTime; label: string }[] = [
  { value: "none", label: "Sin notificación" },
  { value: "15min", label: "15 min antes" },
  { value: "30min", label: "30 min antes" },
  { value: "1h", label: "1 hora antes" },
  { value: "2h", label: "2 horas antes" },
  { value: "1day", label: "1 día antes" },
];

function AddEditExerciseScreen() {
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/ajustes/ejercicios");
  const { create, update, byId } = useExercises();
  const { items: pets } = usePets();
  const isEditing = !!exerciseId;
  const existing = exerciseId ? byId(exerciseId) : undefined;

  const [selectedPetId, setSelectedDogId] = useState(
    existing?.pet_id ?? pets[0]?.id ?? "",
  );
  const [type, setType] = useState<ExerciseType>(existing?.type ?? "caminata");
  const [customTypeDescription, setCustomTypeDescription] = useState(
    existing?.custom_type_description ?? "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    existing?.duration_minutes?.toString() ?? "30",
  );
  const [timesPerDay, setTimesPerDay] = useState(
    existing?.times_per_day?.toString() ?? "1",
  );
  const [startTime, setStartTime] = useState(
    shortTime(existing?.start_time) || "07:00",
  );
  const [endTime, setEndTime] = useState(
    shortTime(existing?.end_time) || "21:00",
  );
  const [startDate, setStartDate] = useState(existing?.start_date ?? today());
  const [isPermanent, setIsPermanent] = useState(existing?.is_permanent ?? true);
  const [durationWeeks, setDurationWeeks] = useState(
    existing?.duration_weeks?.toString() ?? "4",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [notificationTime, setNotificationTime] = useState<NotificationTime>(
    existing?.notification_time ?? "15min",
  );
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(
    existing?.scheduled_times?.map(shortTime) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const times = parseInt(timesPerDay || "1");
    if (!isNaN(times) && times > 0 && startTime && endTime) {
      setScheduledTimes(calculateScheduledTimes(startTime, endTime, times));
    }
  }, [startTime, endTime, timesPerDay]);

  const handleSave = async () => {
    if (!selectedPetId) {
      setError("Selecciona una mascota");
      return;
    }
    if (type === "otro" && !customTypeDescription.trim()) {
      setError("Especifica el tipo de ejercicio");
      return;
    }
    const dur = parseInt(durationMinutes);
    const times = parseInt(timesPerDay);
    if (isNaN(dur) || dur <= 0) {
      setError("Duración inválida");
      return;
    }
    if (isNaN(times) || times <= 0) {
      setError("Frecuencia inválida");
      return;
    }
    const weeks = parseInt(durationWeeks);
    if (!isPermanent && (isNaN(weeks) || weeks <= 0)) {
      setError("Duración en semanas inválida");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let endDate: string | undefined;
      if (!isPermanent) {
        const d = parseLocalDate(startDate);
        d.setDate(d.getDate() + weeks * 7 - 1);
        endDate = formatLocalDate(d);
      }
      const data = {
        pet_id: selectedPetId,
        type,
        custom_type_description:
          type === "otro" ? customTypeDescription.trim() : undefined,
        duration_minutes: dur,
        times_per_day: times,
        start_time: startTime,
        end_time: endTime,
        scheduled_times: scheduledTimes,
        start_date: startDate,
        is_permanent: isPermanent,
        duration_weeks: isPermanent ? undefined : weeks,
        end_date: endDate,
        notes: notes.trim(),
        is_active: existing?.is_active ?? true,
        notification_time: notificationTime,
      };
      if (isEditing && exerciseId) await update.mutateAsync({ id: exerciseId, data: data });
      else await create.mutateAsync(data);
      goBack();
    } catch {
      setError("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 lg:max-w-3xl lg:mx-auto lg:w-full">
        <button
          onClick={goBack}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeft size={18} className="text-gray-800" />
        </button>
        <h2 className="text-gray-900 font-bold text-lg">
          {isEditing ? "Editar rutina" : "Nueva rutina"}
        </h2>
      </div>

      <div className="px-5 flex flex-col gap-4 lg:max-w-3xl lg:mx-auto lg:w-full">
        {/* Mascota */}
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">
            Mascota
          </label>
          <div className="flex flex-wrap gap-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedDogId(pet.id)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${selectedPetId === pet.id ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}
              >
                {pet.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de ejercicio */}
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">
            Tipo de ejercicio
          </label>
          <div className="grid grid-cols-2 gap-2">
            {exerciseTypes.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2.5 rounded-xl font-semibold text-sm transition-colors text-center ${type === t ? "bg-indigo-600 text-white" : `${exerciseTypeColors[t] ?? "bg-gray-100"} text-gray-800`}`}
              >
                {exerciseTypeLabels[t]}
              </button>
            ))}
          </div>
          {type === "otro" && (
            <input
              value={customTypeDescription}
              onChange={(e) => setCustomTypeDescription(e.target.value)}
              placeholder="Describe el tipo de ejercicio"
              className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
        </div>

        {/* Duración y repeticiones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-700 font-semibold text-sm block mb-1">
              Duración (min)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min={1}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="text-gray-700 font-semibold text-sm block mb-1">
              Veces al día
            </label>
            <input
              type="number"
              value={timesPerDay}
              onChange={(e) => setTimesPerDay(e.target.value)}
              min={1}
              max={10}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Ventana horaria */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-700 font-semibold text-sm block mb-1">
              Inicio ventana
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="text-gray-700 font-semibold text-sm block mb-1">
              Fin ventana
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Horarios calculados */}
        {scheduledTimes.length > 0 && (
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-green-700 font-semibold text-xs mb-1">
              Horarios calculados
            </p>
            <p className="text-green-900 text-sm">
              {scheduledTimes.join(", ")}
            </p>
          </div>
        )}

        {/* Fecha inicio */}
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-1">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Duración / permanente */}
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">
            Duración
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPermanent(true)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${isPermanent ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}
            >
              Permanente
            </button>
            <button
              onClick={() => setIsPermanent(false)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${!isPermanent ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}
            >
              Por semanas
            </button>
          </div>
          {!isPermanent && (
            <div className="mt-2">
              <label className="text-gray-600 text-xs font-semibold block mb-1">
                Número de semanas
              </label>
              <div className="flex gap-2 mb-2">
                {[1, 2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => setDurationWeeks(w.toString())}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${durationWeeks === w.toString() ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}
                  >
                    {w}s
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                min={1}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}
        </div>

        {/* Notificación */}
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">
            Notificación
          </label>
          <select
            value={notificationTime}
            onChange={(e) =>
              setNotificationTime(e.target.value as NotificationTime)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {notificationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-1">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl text-base disabled:opacity-60 active:scale-95 transition-transform"
        >
          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Agregar rutina"}
        </button>
      </div>
    </div>
  );
}

export default AddEditExerciseScreen;
