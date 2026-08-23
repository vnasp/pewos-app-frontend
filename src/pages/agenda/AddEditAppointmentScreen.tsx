import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import PetPicker from "../../components/pets/PetPicker";
import Button from "../../components/ui/Button";
import ErrorText from "../../components/ui/ErrorText";
import { Field, FieldGroup } from "../../components/ui/Field";
import FormScreen from "../../components/ui/FormScreen";
import { Input, Select, TextArea } from "../../components/ui/Input";
import {
  appointmentTypeLabels,
  notificationOptions,
  recurrenceLabels,
} from "../../constants/labels";
import { useAppointments, usePetOptions } from "../../hooks/queries";
import type {
  AppointmentType,
  NotificationTime,
  RecurrencePattern,
} from "../../types";
import { today } from "../../utils/date";

const appointmentTypes: AppointmentType[] = [
  "control",
  "examenes",
  "operacion",
  "fisioterapia",
  "vacuna",
  "desparasitacion",
  "otro",
];

const recurrenceOptions: RecurrencePattern[] = [
  "none",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
];

function AddEditAppointmentScreen() {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/agenda");
  const { create, update, byId } = useAppointments();
  const isEditing = !!appointmentId;
  const existing = appointmentId
    ? byId(appointmentId)
    : undefined;
  const pets = usePetOptions(existing?.pet_id);

  const [selectedPetId, setSelectedPetId] = useState(
    existing?.pet_id ?? pets[0]?.id ?? "",
  );
  const [date, setDate] = useState(existing?.date ?? today());
  const [time, setTime] = useState(existing?.time ?? "09:00");
  const [type, setType] = useState<AppointmentType>(
    existing?.type ?? "control",
  );
  const [customTypeDescription, setCustomTypeDescription] = useState(
    existing?.custom_type_description ?? "",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [notificationTime, setNotificationTime] = useState<NotificationTime>(
    existing?.notification_time ?? "1day",
  );
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    existing?.recurrence_pattern ?? "none",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    existing?.recurrence_end_date ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selectedPetId) {
      setError("Selecciona una mascota");
      return;
    }
    if (type === "otro" && !customTypeDescription.trim()) {
      setError("Especifica el tipo de cita");
      return;
    }
    if (recurrencePattern !== "none" && !recurrenceEndDate) {
      setError("Especifica la fecha fin de repetición");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data = {
        pet_id: selectedPetId,
        date,
        time,
        type,
        custom_type_description:
          type === "otro" ? customTypeDescription.trim() : undefined,
        notes: notes.trim(),
        notification_time: notificationTime,
        recurrence_pattern: recurrencePattern,
        recurrence_end_date:
          recurrencePattern !== "none" && recurrenceEndDate
            ? recurrenceEndDate
            : undefined,
      };
      if (isEditing && appointmentId)
        await update.mutateAsync({ id: appointmentId, data: data });
      else await create.mutateAsync(data);
      goBack();
    } catch {
      setError("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title={isEditing ? "Editar cita" : "Nueva cita"} onBack={goBack}>
      <PetPicker pets={pets} value={selectedPetId} onChange={setSelectedPetId} />

      <FieldGroup label="Tipo de cita">
        <div className="grid grid-cols-2 gap-2">
          {appointmentTypes.map((t) => (
            <Button
              key={t}
              size="sm"
              variant="secondary"
              selected={type === t}
              onClick={() => setType(t)}
              block
            >
              {appointmentTypeLabels[t]}
            </Button>
          ))}
        </div>
        {type === "otro" && (
          <Input
            value={customTypeDescription}
            onChange={(e) => setCustomTypeDescription(e.target.value)}
            placeholder="Describe el tipo de cita"
            className="mt-2"
          />
        )}
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Hora">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>

      <Field label="Repetición">
        <Select
          value={recurrencePattern}
          onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
        >
          {recurrenceOptions.map((r) => (
            <option key={r} value={r}>
              {recurrenceLabels[r]}
            </option>
          ))}
        </Select>
      </Field>

      {recurrencePattern !== "none" && (
        <Field label="Fecha fin de repetición">
          <Input
            type="date"
            value={recurrenceEndDate}
            onChange={(e) => setRecurrenceEndDate(e.target.value)}
          />
        </Field>
      )}

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

      <Field label="Notas (opcional)">
        <TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Instrucciones, preparaciones..."
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button block onClick={handleSave} disabled={saving}>
        {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar cita"}
      </Button>
    </FormScreen>
  );
}

export default AddEditAppointmentScreen;
