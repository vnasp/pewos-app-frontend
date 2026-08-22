import { ArrowLeft, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import * as apiClient from "../../api";
import { usePets } from "../../hooks/queries";
import type { Pet } from "../../types";
import { today } from "../../utils/date";

function AddEditPetScreen() {
  const { id: petId } = useParams();
  const navigate = useNavigate();
  // Vuelve a una ruta concreta y no con `navigate(-1)`: quien llega por un enlace
  // compartido no tiene historial atrás y retroceder lo sacaría de la app.
  const goBack = () => navigate("/mascotas");
  const { create, update, byId } = usePets();
  // Si la mascota se creó pero la foto falló, seguimos en el formulario con su id a
  // mano: sin esto, volver a guardar crearía una segunda mascota idéntica.
  const [savedId, setSavedId] = useState<string | null>(null);
  const editingId = petId ?? savedId;
  const isEditing = !!editingId;
  const existing = byId(petId);

  const [name, setName] = useState(existing?.name ?? "");
  const [breed, setBreed] = useState(existing?.breed ?? "");
  const [birthDate, setBirthDate] = useState(existing?.birth_date ?? today());
  const [gender, setGender] = useState<"male" | "female">(existing?.gender ?? "male");
  const [neutered, setNeutered] = useState(existing?.neutered ?? false);

  // Vista previa local mientras no se ha subido; la definitiva llega en `photo_url`.
  const [preview, setPreview] = useState<string | null>(existing?.photo_url ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("La foto debe ser JPG, PNG o WebP");
      return;
    }
    setError(null);
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /**
   * Sube la foto directo a S3 con una URL prefirmada. El archivo no pasa por la API, que
   * corre en una instancia chica; antes la imagen se guardaba como base64 en la base.
   */
  const uploadPhoto = async (targetPetId: string): Promise<string | null> => {
    if (!pendingFile) return null;
    const { upload_url, photo_key } = await apiClient.pets.photoUploadUrl(
      targetPetId,
      pendingFile.type,
    );
    // `fetch` solo rechaza por red o por CORS; un 403 de S3 llega como respuesta normal.
    // Distinguirlos importa porque el CORS del bucket es lo que más se olvida configurar.
    const response = await fetch(upload_url, {
      method: "PUT",
      body: pendingFile,
      headers: { "Content-Type": pendingFile.type },
    }).catch(() => {
      throw new Error("no se pudo contactar el bucket (revisa su configuración de CORS)");
    });
    if (!response.ok) throw new Error(`S3 respondió ${response.status}`);
    return photo_key;
  };

  const reason = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

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
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 lg:max-w-2xl lg:mx-auto lg:w-full">
        <button
          onClick={goBack}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeft size={18} className="text-gray-800" />
        </button>
        <h2 className="text-gray-900 font-bold text-lg">
          {isEditing ? "Editar mascota" : "Agregar mascota"}
        </h2>
      </div>

      <div className="px-5 flex flex-col gap-4 lg:max-w-2xl lg:mx-auto lg:w-full">
        <div className="flex flex-col items-center py-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="active:scale-95 transition-transform"
          >
            <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="foto" className="w-full h-full object-cover" />
              ) : (
                <Camera size={36} className="text-gray-400" />
              )}
            </div>
            <p className="text-indigo-600 text-sm font-semibold text-center mt-2">
              {preview ? "Cambiar foto" : "Agregar foto"}
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

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-1">Nombre *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Max, Luna..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-1">Raza</label>
          <input
            value={breed ?? ""}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Ej: Labrador, Mestizo..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={birthDate ?? ""}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">Género</label>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${gender === g ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}
              >
                {g === "male" ? "Macho" : "Hembra"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
          <span className="text-gray-700 font-semibold text-sm">
            {gender === "male" ? "Castrado" : "Esterilizada"}
          </span>
          <button
            onClick={() => setNeutered(!neutered)}
            className={`w-11 h-6 rounded-full transition-colors ${neutered ? "bg-green-500" : "bg-gray-300"}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${neutered ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl text-base disabled:opacity-60 active:scale-95 transition-transform mt-2"
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar mascota"}
        </button>
      </div>
    </div>
  );
}

export default AddEditPetScreen;
