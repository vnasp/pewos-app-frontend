import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import PetPicker from "../../components/pets/PetPicker";
import Button from "../../components/ui/Button";
import ErrorText from "../../components/ui/ErrorText";
import { Field, FieldGroup } from "../../components/ui/Field";
import FormScreen from "../../components/ui/FormScreen";
import { Input, Select, TextArea } from "../../components/ui/Input";
import {
  careTypeLabels,
  notificationOptions,
  weekDayInitials,
  weekDayLabels,
} from "../../constants/labels";
import { useCares, usePetOptions } from "../../hooks/queries";
import type { CareType, NotificationTime } from "../../types";
import { formatLocalDate, parseLocalDate, shortTime, today } from "../../utils/date";
import { calculateScheduledTimes } from "../../utils/schedule";

const careTypes: CareType[] = [
  "limpieza_herida",
  "frio",
  "calor",
  "infrarrojo",
  "laser",
  "otro",
];

/** De lunes a domingo, como se lee un calendario acá; `days_of_week` usa 0=domingo. */
const weekDays = [1, 2, 3, 4, 5, 6, 0];

function AddEditCareScreen() {
  const { id: careId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/ajustes/cuidados");
  const { create, update, byId } = useCares();
  const isEditing = !!careId;
  const existing = careId ? byId(careId) : undefined;
  const pets = usePetOptions(existing?.pet_id);

  const [selectedPetId, setSelectedPetId] = useState(
    existing?.pet_id ?? pets[0]?.id ?? "",
  );
  const [type, setType] = useState<CareType>(
    existing?.type ?? "limpieza_herida",
  );
  const [customTypeDescription, setCustomTypeDescription] = useState(
    existing?.custom_type_description ?? "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    existing?.duration_minutes?.toString() ?? "15",
  );
  const [timesPerDay, setTimesPerDay] = useState(
    existing?.times_per_day?.toString() ?? "1",
  );
  const [startTime, setStartTime] = useState(
    shortTime(existing?.start_time) || "08:00",
  );
  const [endTime, setEndTime] = useState(
    shortTime(existing?.end_time) || "21:00",
  );
  const [startDate, setStartDate] = useState(existing?.start_date ?? today());
  const [isPermanent, setIsPermanent] = useState(
    existing?.is_permanent ?? false,
  );
  const [durationDays, setDurationDays] = useState(
    existing?.duration_days?.toString() ?? "14",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [notificationTime, setNotificationTime] = useState<NotificationTime>(
    existing?.notification_time ?? "15min",
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    existing?.days_of_week ?? [],
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
      setError("Describe el tipo de cuidado");
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
    const days = parseInt(durationDays);
    if (!isPermanent && (isNaN(days) || days <= 0)) {
      setError("Duración en días inválida");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let endDate: string | undefined;
      if (!isPermanent) {
        const d = parseLocalDate(startDate);
        d.setDate(d.getDate() + days - 1);
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
        duration_days: isPermanent ? undefined : days,
        end_date: endDate,
        notes: notes.trim(),
        is_active: existing?.is_active ?? true,
        notification_time: notificationTime,
        days_of_week: daysOfWeek.length > 0 ? daysOfWeek : undefined,
      };
      if (isEditing && careId) await update.mutateAsync({ id: careId, data: data });
      else await create.mutateAsync(data);
      goBack();
    } catch {
      setError("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title={isEditing ? "Editar cuidado" : "Nuevo cuidado"} onBack={goBack}>
      <PetPicker pets={pets} value={selectedPetId} onChange={setSelectedPetId} />

      <FieldGroup label="Tipo de cuidado">
        <div className="grid grid-cols-2 gap-2">
          {careTypes.map((t) => (
            <Button
              key={t}
              size="sm"
              variant="secondary"
              selected={type === t}
              onClick={() => setType(t)}
              block
            >
              {careTypeLabels[t]}
            </Button>
          ))}
        </div>
        {type === "otro" && (
          <Input
            value={customTypeDescription}
            onChange={(e) => setCustomTypeDescription(e.target.value)}
            placeholder="Describe el tipo de cuidado"
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
        <div className="bg-care-soft rounded-2xl px-4 py-3">
          <p className="text-care font-bold text-xs mb-1">Horarios calculados</p>
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
              selected={!isPermanent}
              onClick={() => setIsPermanent(false)}
              block
            >
              Por días
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="secondary"
              selected={isPermanent}
              onClick={() => setIsPermanent(true)}
              block
            >
              Sin fin
            </Button>
          </div>
        </div>
        {!isPermanent && (
          <div className="mt-3">
            <FieldGroup label="Número de días">
              <div className="flex gap-2 mb-2">
                {[7, 10, 14, 21].map((d) => (
                  <div key={d} className="flex-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      selected={durationDays === d.toString()}
                      onClick={() => setDurationDays(d.toString())}
                      block
                    >
                      {d}
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                type="number"
                aria-label="Número de días"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                min={1}
              />
            </FieldGroup>
          </div>
        )}
      </FieldGroup>

      <FieldGroup
        label="Días de la semana"
        hint={
          daysOfWeek.length > 0
            ? weekDays
                .filter((d) => daysOfWeek.includes(d))
                .map((d) => weekDayLabels[d])
                .join(", ")
            : "Sin ninguno marcado se hace todos los días."
        }
      >
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <Button
              key={day}
              size="sm"
              variant="secondary"
              selected={daysOfWeek.includes(day)}
              title={weekDayLabels[day]}
              onClick={() =>
                setDaysOfWeek((prev) =>
                  prev.includes(day)
                    ? prev.filter((d) => d !== day)
                    : [...prev, day].sort((a, b) => a - b),
                )
              }
              block
            >
              {weekDayInitials[day]}
            </Button>
          ))}
        </div>
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
        {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar cuidado"}
      </Button>
    </FormScreen>
  );
}

export default AddEditCareScreen;
