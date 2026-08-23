import { ArchiveRestore, Camera, Heart, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import * as apiClient from "../../api";
import ArchivePetSheet from "../../components/pets/ArchivePetSheet";
import PetPhoto from "../../components/pets/PetPhoto";
import WeightHistory from "../../components/pets/WeightHistory";
import Button from "../../components/ui/Button";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import ErrorText from "../../components/ui/ErrorText";
import { Field, FieldGroup } from "../../components/ui/Field";
import FormScreen from "../../components/ui/FormScreen";
import { Input } from "../../components/ui/Input";
import { archiveReasonSummary } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { usePets, usePetWeights } from "../../hooks/queries";
import type { Pet } from "../../types";
import { formatLongDate, today } from "../../utils/date";
import { preparePhoto } from "../../utils/image";

function AddEditPetScreen() {
  const { id: petId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/mascotas");
  const { create, update, remove, archive, unarchive, byId } = usePets();
  const { canWrite } = useAuth();
  // Si la mascota se creó pero la foto falló, seguimos en el formulario con su id a
  // mano: sin esto, volver a guardar crearía una segunda mascota idéntica.
  const [savedId, setSavedId] = useState<string | null>(null);
  const editingId = petId ?? savedId;
  const isEditing = !!editingId;
  const existing = byId(petId);
  const weights = usePetWeights(editingId ?? undefined);

  const [name, setName] = useState(existing?.name ?? "");
  const [breed, setBreed] = useState(existing?.breed ?? "");
  const [birthDate, setBirthDate] = useState(existing?.birth_date ?? today());
  const [gender, setGender] = useState<"male" | "female">(existing?.gender ?? "male");
  const [neutered, setNeutered] = useState(existing?.neutered ?? false);
  const [weight, setWeight] = useState(existing?.weight_kg ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const reason = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const [pendingPhoto, setPendingPhoto] = useState<Blob | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Derivada y no en estado: `existing` llega con la consulta, y guardarla en un
  // `useState` congelaría el primer render, cuando todavía no hay mascota que mostrar.
  const preview = localPreview ?? existing?.photo_url ?? null;

  // La URL local ocupa memoria hasta que se revoca, y acá se reemplaza cada vez que se
  // elige otra foto.
  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Limpiar el input deja que elegir el mismo archivo otra vez vuelva a disparar
    // `change`, que es lo que uno intenta después de un error.
    e.target.value = "";
    if (!file) return;

    setError(null);
    setPreparing(true);
    try {
      // La vista previa es ya la imagen procesada, así que lo que ves es lo que sube.
      const photo = await preparePhoto(file);
      setPendingPhoto(photo);
      setLocalPreview(URL.createObjectURL(photo));
    } catch (err) {
      setError(reason(err, "No se pudo leer la imagen"));
    } finally {
      setPreparing(false);
    }
  };

  /**
   * Sube a S3 la imagen ya procesada, con una URL prefirmada. El archivo no pasa por la
   * API, que corre en una instancia chica; antes se guardaba como base64 en la base.
   */
  const uploadPhoto = async (targetPetId: string): Promise<string | null> => {
    if (!pendingPhoto) return null;
    const { upload_url, photo_key } = await apiClient.pets.photoUploadUrl(
      targetPetId,
      pendingPhoto.type,
    );
    // `fetch` solo rechaza por red o por CORS; un 403 de S3 llega como respuesta normal.
    // Distinguirlos importa porque el CORS del bucket es lo que más se olvida configurar.
    const response = await fetch(upload_url, {
      method: "PUT",
      body: pendingPhoto,
      headers: { "Content-Type": pendingPhoto.type },
    }).catch(() => {
      throw new Error("no se pudo contactar el bucket (revisa su configuración de CORS)");
    });
    if (!response.ok) throw new Error(`S3 respondió ${response.status}`);
    return photo_key;
  };

  /**
   * La mascota y su foto se guardan en dos pasos que fallan por separado.
   *
   * Son cuatro peticiones sin transacción —crear, pedir la URL, subir, guardar la key— y
   * la foto necesita el id de la mascota para armar su ruta, así que no hay forma de
   * hacerla primero. Tratar todo como una sola operación era el bug: cualquier tropiezo
   * en la foto mostraba "no se pudo guardar" con la mascota ya creada, y reintentar
   * dejaba dos.
   */
  const handleSave = async () => {
    if (!name.trim()) {
      setError("Ingresa el nombre de la mascota");
      return;
    }
    setError(null);
    setSaving(true);

    const data = {
      name: name.trim(),
      breed: breed.trim() || null,
      birth_date: birthDate || null,
      gender,
      neutered,
    };

    try {
      let saved: Pet;
      try {
        saved = editingId
          ? await update.mutateAsync({ id: editingId, data })
          : await create.mutateAsync(data);
      } catch (err) {
        setError(reason(err, "No se pudo guardar"));
        return;
      }

      try {
        // Solo si cambió: reguardar el formulario sin tocar el peso no debe registrar
        // un pesaje de hoy repitiendo el número del mes pasado.
        if (weight.trim() && weight.trim() !== existing?.weight_kg) {
          await weights.record.mutateAsync({
            petId: saved.id,
            weight: weight.trim(),
            // La fecha del navegador, no la del servidor, que corre en UTC.
            on: today(),
          });
        }

        const photoKey = await uploadPhoto(saved.id);
        if (photoKey) {
          await update.mutateAsync({ id: saved.id, data: { ...data, photo_key: photoKey } });
        }
      } catch (err) {
        // A partir de acá el formulario edita la mascota que ya existe, así que volver a
        // guardar reintenta la foto en vez de duplicarla.
        setSavedId(saved.id);
        setError(
          `Guardamos a ${data.name}, pero la foto no se subió: ${reason(err, "error desconocido")}. Puedes reintentar o volver sin ella.`,
        );
        return;
      }

      goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title={isEditing ? "Editar mascota" : "Agregar mascota"} onBack={goBack}>
      <div className="flex flex-col items-center py-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={preparing}
          className="active:scale-95 transition-transform disabled:opacity-60"
        >
          <div className="w-28 h-28 bg-canvas rounded-full overflow-hidden flex items-center justify-center">
            <PetPhoto
              url={preview}
              alt={name || "foto"}
              fallback={<Camera size={36} className="text-subtle" />}
            />
          </div>
          <p className="text-brand text-sm font-bold text-center mt-2">
            {preparing ? "Procesando..." : preview ? "Cambiar foto" : "Agregar foto"}
          </p>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePickImage}
          className="hidden"
        />
      </div>

      <Field label="Nombre" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Max, Luna..."
        />
      </Field>

      <Field label="Raza">
        <Input
          value={breed ?? ""}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Ej: Labrador, Mestizo..."
        />
      </Field>

      <Field label="Fecha de nacimiento">
        <Input
          type="date"
          value={birthDate ?? ""}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </Field>

      <Field
        label="Peso actual (kg)"
        hint="Se guarda con la fecha de hoy y queda en el historial."
      >
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ej: 8,4"
        />
      </Field>

      {isEditing && (
        <WeightHistory
          entries={weights.items}
          onDelete={(weightId) => weights.remove.mutate(weightId)}
          canWrite={canWrite}
        />
      )}

      <FieldGroup label="Género">
        <div className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <div key={g} className="flex-1">
              <Button
                variant="secondary"
                selected={gender === g}
                onClick={() => setGender(g)}
                block
              >
                {g === "male" ? "Macho" : "Hembra"}
              </Button>
            </div>
          ))}
        </div>
      </FieldGroup>

      <div className="flex items-center justify-between bg-white rounded-2xl border border-line px-4 py-3">
        <span className="text-muted font-bold text-sm">
          {gender === "male" ? "Castrado" : "Esterilizada"}
        </span>
        <button
          type="button"
          onClick={() => setNeutered(!neutered)}
          role="switch"
          aria-checked={neutered}
          className={`w-11 h-6 rounded-full transition-colors ${neutered ? "bg-success" : "bg-subtle/40"}`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${neutered ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      <ErrorText>{error}</ErrorText>

      <Button block onClick={handleSave} disabled={saving || preparing}>
        {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar mascota"}
      </Button>

      {/* Solo al editar, y separado por una línea: ni archivar ni borrar son
          alternativas a guardar, y en la lista el rojo estaba a un toque de distancia. */}
      {isEditing && canWrite && (
        <div className="border-t border-line pt-5 mt-3 flex flex-col gap-3">
          {existing?.archived_on ? (
            <>
              <p className="text-sm text-muted font-medium text-center">
                {existing.archived_reason &&
                  `${archiveReasonSummary[existing.archived_reason]} ${formatLongDate(existing.archived_on)}.`}
              </p>
              <Button
                variant="secondary"
                block
                onClick={() => unarchive.mutate(existing.id)}
                leading={<ArchiveRestore size={16} aria-hidden />}
              >
                Volver a activarla
              </Button>
              <p className="text-xs text-subtle text-center -mt-1">
                Sus medicamentos y rutinas quedaron desactivados; tendrás que
                encenderlos de nuevo.
              </p>
            </>
          ) : (
            <Button
              variant="secondary"
              block
              onClick={() => setArchiving(true)}
              leading={<Heart size={16} aria-hidden />}
            >
              Ya no está conmigo
            </Button>
          )}

          <Button
            variant="danger"
            block
            onClick={() => setConfirmDelete(true)}
            leading={<Trash2 size={16} aria-hidden />}
          >
            Eliminar mascota
          </Button>
          <p className="text-xs text-subtle text-center -mt-1">
            Eliminar borra su historial completo. Si se despidió de ti, archívala.
          </p>
        </div>
      )}

      <ArchivePetSheet
        open={archiving}
        petName={name.trim() || "Tu mascota"}
        onClose={() => setArchiving(false)}
        onConfirm={(reason, on) => {
          archive.mutate({ id: editingId!, reason, on });
          goBack();
        }}
      />

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          remove.mutate(editingId!);
          goBack();
        }}
        title={`¿Eliminar a ${name.trim() || "esta mascota"}?`}
        description="Se borrarán también sus citas, medicamentos, rutinas de ejercicio, cuidados, veterinarios y su historial de peso. No se puede deshacer."
        confirmLabel="Eliminar para siempre"
        requireText={name.trim() || undefined}
      />
    </FormScreen>
  );
}

export default AddEditPetScreen;
