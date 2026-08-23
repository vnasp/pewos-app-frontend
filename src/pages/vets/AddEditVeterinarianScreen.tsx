import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import PetPicker from "../../components/pets/PetPicker";
import Button from "../../components/ui/Button";
import ErrorText from "../../components/ui/ErrorText";
import { Field } from "../../components/ui/Field";
import FormScreen from "../../components/ui/FormScreen";
import { Input, TextArea } from "../../components/ui/Input";
import { usePetOptions, useVeterinarians } from "../../hooks/queries";

function AddEditVeterinarianScreen() {
  const { id: veterinarianId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/veterinarios");
  const { create, update, byId } = useVeterinarians();
  const isEditing = !!veterinarianId;
  const existing = veterinarianId
    ? byId(veterinarianId)
    : undefined;
  const pets = usePetOptions(existing?.pet_id);

  const [selectedPetId, setSelectedPetId] = useState(
    existing?.pet_id ?? pets[0]?.id ?? "",
  );
  const [name, setName] = useState(existing?.name ?? "");
  const [clinicName, setClinicName] = useState(existing?.clinic_name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selectedPetId) {
      setError("Selecciona una mascota");
      return;
    }
    if (!name.trim()) {
      setError("Ingresa el nombre del veterinario");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data = {
        pet_id: selectedPetId,
        name: name.trim(),
        clinic_name: clinicName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEditing && veterinarianId)
        await update.mutateAsync({ id: veterinarianId, data: data });
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
      title={isEditing ? "Editar veterinario" : "Agregar veterinario"}
      onBack={goBack}
    >
      <PetPicker pets={pets} value={selectedPetId} onChange={setSelectedPetId} />

      <Field label="Nombre del veterinario" required>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. Juan Pérez"
        />
      </Field>

      <Field label="Clínica / Centro veterinario">
        <Input
          type="text"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="Clínica Veterinaria San Francisco"
        />
      </Field>

      <Field label="Teléfono">
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+56 9 1234 5678"
        />
      </Field>

      <Field label="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contacto@clinica.cl"
        />
      </Field>

      <Field label="Dirección">
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Av. Principal 123, Providencia"
        />
      </Field>

      <Field label="Notas">
        <TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Horarios de atención, especialidad, etc."
          rows={3}
        />
      </Field>

      <ErrorText>{error}</ErrorText>

      <Button block onClick={handleSave} disabled={saving}>
        {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar"}
      </Button>
    </FormScreen>
  );
}

export default AddEditVeterinarianScreen;
