import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import PetPicker from "../../components/pets/PetPicker";
import Button from "../../components/ui/Button";
import ErrorText from "../../components/ui/ErrorText";
import { Field, FieldGroup } from "../../components/ui/Field";
import FormScreen from "../../components/ui/FormScreen";
import { Input, Select, TextArea } from "../../components/ui/Input";
import { exerciseTypeLabels, notificationOptions } from "../../constants/labels";
import { useExercises, usePetOptions } from "../../hooks/queries";
import type { ExerciseType, NotificationTime } from "../../types";
import { formatLocalDate, parseLocalDate, shortTime, today } from "../../utils/date";
import { calculateScheduledTimes } from "../../utils/schedule";

const exerciseTypes: ExerciseType[] = [
  "caminata",
  "cavaletti",
  "balanceo",
  "slalom",
  "entrenamiento",
  "otro",
];

function AddEditExerciseScreen() {
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/ajustes/ejercicios");
  const { create, update, byId } = useExercises();
  const isEditing = !!exerciseId;
  const existing = exerciseId ? byId(exerciseId) : undefined;
  const pets = usePetOptions(existing?.pet_id);

  const [selectedPetId, setSelectedPetId] = useState(
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
    <FormScreen title={isEditing ? "Editar rutina" : "Nueva rutina"} onBack={goBack}>
      <PetPicker pets={pets} value={selectedPetId} onChange={setSelectedPetId} />

      <FieldGroup label="Tipo de ejercicio">
        <div className="grid grid-cols-2 gap-2">
          {exerciseTypes.map((t) => (
            <Button
              key={t}
              size="sm"
              variant="secondary"
              selected={type === t}
              onClick={() => setType(t)}
              block
            >
              {exerciseTypeLabels[t]}
            </Button>
          ))}
        </div>
        {type === "otro" && (
          <Input
            value={customTypeDescription}
            onChange={(e) => setCustomTypeDescription(e.target.value)}
            placeholder="Describe el tipo de ejercicio"
            className="mt-2"
          />
        )}
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Duración (min)">
          <Input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            min={1}
          />
        </Field>
        <Field label="Veces al día">
          <Input
            type="number"
            value={timesPerDay}
            onChange={(e) => setTimesPerDay(e.target.value)}
            min={1}
            max={10}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Inicio ventana">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Field>
        <Field label="Fin ventana">
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Field>
      </div>

      {scheduledTimes.length > 0 && (
        <div className="bg-exercise-soft rounded-2xl px-4 py-3">
          <p className="text-exercise font-bold text-xs mb-1">Horarios calculados</p>
          <p className="text-ink text-sm">{scheduledTimes.join(", ")}</p>
        </div>
      )}

      <Field label="Fecha de inicio">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Field>

      <FieldGroup label="Duración">
        <div className="flex gap-2">
          <div className="flex-1">
            <Button
              variant="secondary"
              selected={isPermanent}
              onClick={() => setIsPermanent(true)}
              block
            >
              Permanente
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="secondary"
              selected={!isPermanent}
              onClick={() => setIsPermanent(false)}
              block
            >
              Por semanas
            </Button>
          </div>
        </div>
        {!isPermanent && (
          <div className="mt-3">
            <FieldGroup label="Número de semanas">
              <div className="flex gap-2 mb-2">
                {[1, 2, 4, 8].map((w) => (
                  <div key={w} className="flex-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      selected={durationWeeks === w.toString()}
                      onClick={() => setDurationWeeks(w.toString())}
                      block
                    >
                      {w}s
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                type="number"
                aria-label="Número de semanas"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                min={1}
              />
            </FieldGroup>
          </div>
        )}
      </FieldGroup>

      <Field label="Notificación">
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(e.target.value as NotificationTime)}
        >
          {notificationOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Notas">
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button block onClick={handleSave} disabled={saving}>
        {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar rutina"}
      </Button>
    </FormScreen>
  );
}

export default AddEditExerciseScreen;
