import { Clock, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import PetPicker from "../../components/pets/PetPicker";
import Button from "../../components/ui/Button";
import ErrorText from "../../components/ui/ErrorText";
import { Field, FieldGroup } from "../../components/ui/Field";
import FormScreen from "../../components/ui/FormScreen";
import { Input, Select, TextArea } from "../../components/ui/Input";
import { notificationOptions } from "../../constants/labels";
import { useMealTimes, useMedications, usePetOptions } from "../../hooks/queries";
import type { NotificationTime, ScheduleType } from "../../types";
import { addDays, shortTime, today } from "../../utils/date";
import { calculateTimesFromHours } from "../../utils/schedule";

function AddEditMedicationScreen() {
  const { id: medicationId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/ajustes/medicamentos");
  const { create, update, byId } = useMedications();
  const isEditing = !!medicationId;
  const existing = medicationId ? byId(medicationId) : undefined;
  const pets = usePetOptions(existing?.pet_id);

  const [selectedPetId, setSelectedPetId] = useState(
    existing?.pet_id ?? pets[0]?.id ?? "",
  );
  const [name, setName] = useState(existing?.name ?? "");
  const [dosage, setDosage] = useState(existing?.dosage ?? "");
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    existing?.schedule_type ?? "hours",
  );
  const [frequencyHours, setFrequencyHours] = useState(
    existing?.frequency_hours?.toString() ?? "8",
  );
  const [startTime, setStartTime] = useState(
    shortTime(existing?.start_time) || "08:00",
  );
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>(
    existing?.meal_time_ids ?? [],
  );
  // Los horarios son de la mascota, así que cambiarla cambia las opciones.
  const { items: mealTimes } = useMealTimes(selectedPetId);
  const [durationDays, setDurationDays] = useState(
    existing?.duration_days?.toString() ?? "30",
  );
  const [startDate, setStartDate] = useState(existing?.start_date ?? today());
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [notificationTime, setNotificationTime] = useState<NotificationTime>(
    existing?.notification_time ?? "15min",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular scheduled times y end date
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(
    existing?.scheduled_times?.map(shortTime) ?? [],
  );
  const [endDate, setEndDate] = useState<string>(today());

  useEffect(() => {
    const dur = parseInt(durationDays);
    if (!isNaN(dur) && dur >= 0) {
      setEndDate(addDays(startDate, (dur > 0 ? dur : 1) - 1));
    }
    if (scheduleType === "hours") {
      const freq = parseInt(frequencyHours);
      if (!isNaN(freq) && freq > 0)
        setScheduledTimes(calculateTimesFromHours(startTime, freq));
    } else {
      const times = mealTimes
        .filter((m) => selectedMealIds.includes(m.id))
        .map((m) => shortTime(m.time))
        .sort();
      setScheduledTimes(times);
    }
  }, [
    scheduleType,
    frequencyHours,
    startTime,
    selectedMealIds,
    durationDays,
    startDate,
    mealTimes,
  ]);

  const toggleMeal = (id: string) => {
    setSelectedMealIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  };

  const handleSave = async () => {
    if (!selectedPetId) {
      setError("Selecciona una mascota");
      return;
    }
    if (!name.trim()) {
      setError("Ingresa el nombre del medicamento");
      return;
    }
    if (!dosage.trim()) {
      setError("Ingresa la dosis");
      return;
    }
    if (scheduleType === "hours") {
      const freq = parseInt(frequencyHours);
      if (isNaN(freq) || freq <= 0 || freq > 24) {
        setError("Frecuencia inválida (1-24h)");
        return;
      }
    } else if (selectedMealIds.length === 0) {
      setError("Selecciona al menos una comida");
      return;
    }
    const dur = parseInt(durationDays);
    if (isNaN(dur) || dur < 0) {
      setError("Duración inválida");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data = {
        pet_id: selectedPetId,
        name: name.trim(),
        dosage: dosage.trim(),
        schedule_type: scheduleType,
        frequency_hours:
          scheduleType === "hours" ? parseInt(frequencyHours) : undefined,
        start_time: scheduleType === "hours" ? startTime : undefined,
        meal_time_ids: scheduleType === "meals" ? selectedMealIds : [],
        scheduled_times: scheduledTimes,
        duration_days: dur,
        start_date: startDate,
        end_date: endDate,
        notes: notes.trim(),
        notification_time: notificationTime,
        is_active: existing?.is_active ?? true,
      };
      if (isEditing && medicationId) await update.mutateAsync({ id: medicationId, data: data });
      else await create.mutateAsync(data);
      goBack();
    } catch {
      setError("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen
      title={isEditing ? "Editar medicamento" : "Nuevo medicamento"}
      onBack={goBack}
    >
      <PetPicker
        pets={pets}
        value={selectedPetId}
        onChange={(id) => {
          setSelectedPetId(id);
          // Los horarios marcados eran de la otra mascota, y la API los rechaza:
          // limpiarlos evita un 400 que el usuario no sabría interpretar.
          if (id !== selectedPetId) setSelectedMealIds([]);
        }}
      />

      <Field label="Nombre del medicamento" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ibuprofeno, Amoxicilina..."
        />
      </Field>

      <Field label="Dosis" required>
        <Input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Ej: 1 pastilla, 5ml..."
        />
      </Field>

      <FieldGroup label="Programar por">
        <div className="flex gap-2">
          <div className="flex-1">
            <Button
              variant="secondary"
              selected={scheduleType === "hours"}
              onClick={() => setScheduleType("hours")}
              leading={<Clock size={16} aria-hidden />}
              block
            >
              Horas
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="secondary"
              selected={scheduleType === "meals"}
              onClick={() => setScheduleType("meals")}
              leading={<Utensils size={16} aria-hidden />}
              block
            >
              Comidas
            </Button>
          </div>
        </div>
      </FieldGroup>

      {scheduleType === "hours" ? (
        <>
          <FieldGroup label="Cada cuántas horas">
            <div className="flex gap-2 mb-2">
              {[6, 8, 12, 24].map((h) => (
                <div key={h} className="flex-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    selected={frequencyHours === h.toString()}
                    onClick={() => setFrequencyHours(h.toString())}
                    block
                  >
                    {h}h
                  </Button>
                </div>
              ))}
            </div>
            <Input
              type="number"
              aria-label="Cada cuántas horas"
              value={frequencyHours}
              onChange={(e) => setFrequencyHours(e.target.value)}
              min={1}
              max={24}
            />
          </FieldGroup>

          <Field label="Primera dosis">
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Field>
        </>
      ) : (
        <FieldGroup label="Con cuáles comidas">
          <div className="flex flex-col gap-2">
            {mealTimes.map((meal) => {
              const picked = selectedMealIds.includes(meal.id);
              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => toggleMeal(meal.id)}
                  aria-pressed={picked}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-colors ${picked ? "border-brand bg-brand-soft" : "border-line"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${picked ? "bg-brand border-brand" : "border-line"}`}
                  >
                    {picked && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-ink font-bold text-sm">{meal.name}</span>
                  <span className="ml-auto text-subtle text-xs">
                    {shortTime(meal.time)}
                  </span>
                </button>
              );
            })}
          </div>
        </FieldGroup>
      )}

      {scheduledTimes.length > 0 && (
        <div className="bg-appointment-soft rounded-2xl px-4 py-3">
          <p className="text-appointment font-bold text-xs mb-1">Horarios calculados</p>
          <p className="text-ink text-sm">{scheduledTimes.join(", ")}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Inicio">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label="Duración (días)">
          <Input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            min={0}
            placeholder="0=continuo"
          />
        </Field>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[3, 7, 20, 30].map((d) => (
          <Button
            key={d}
            size="sm"
            variant="secondary"
            selected={durationDays === d.toString()}
            onClick={() => setDurationDays(d.toString())}
          >
            {d} días
          </Button>
        ))}
        <Button
          size="sm"
          variant="secondary"
          selected={durationDays === "0"}
          onClick={() => setDurationDays("0")}
        >
          Continuo
        </Button>
      </div>

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
        {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar medicamento"}
      </Button>
    </FormScreen>
  );
}

export default AddEditMedicationScreen;
