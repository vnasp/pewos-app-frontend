import { useState } from "react";

import { ApiError } from "../../api";
import { useAuth } from "../../context/AuthContext";

const FIELD =
  "w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400";

/**
 * Lo que es tuyo y no del grupo.
 *
 * Vivía dentro de "Mi grupo", mezclado con los datos del grupo y las invitaciones. Tu
 * nombre te acompaña a todos los grupos a los que pertenezcas, así que no es de ninguno.
 */
function ProfileScreen() {
  const { user, redeemInvitation, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [saved, setSaved] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error");
    }
  };

  const unchanged =
    firstName.trim() === (user?.first_name ?? "") &&
    lastName.trim() === (user?.last_name ?? "");

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6 gap-6 lg:max-w-2xl lg:mx-auto lg:w-full">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      <section>
        <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">Tu nombre</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-700 font-semibold text-sm block mb-1">
                Nombre
              </label>
              <input
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setSaved(false);
                }}
                placeholder="Ana"
                maxLength={80}
                className={FIELD}
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-700 font-semibold text-sm block mb-1">
                Apellido
              </label>
              <input
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setSaved(false);
                }}
                placeholder="Pérez"
                maxLength={80}
                className={FIELD}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-1">
            Al marcar algo como hecho aparece solo tu nombre.
          </p>
          <button
            onClick={() =>
              run(async () => {
                await updateProfile({
                  first_name: firstName.trim(),
                  last_name: lastName.trim(),
                });
                setSaved(true);
              })
            }
            disabled={unchanged}
            className="bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-transform"
          >
            {saved ? "Guardado" : "Guardar nombre"}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">Tu cuenta</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold mb-1">Correo</p>
          <p className="text-gray-900 text-sm break-all">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-2">
            Identifica tu cuenta y no se puede cambiar. Es lo que se muestra a los demás
            mientras no pongas tu nombre.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">
          Unirme a otro grupo
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Pega el código aquí"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() =>
              run(async () => {
                await redeemInvitation(joinCode.trim());
                setJoinCode("");
              })
            }
            disabled={!joinCode.trim()}
            className="bg-indigo-600 text-white font-semibold px-4 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-transform"
          >
            Unirme
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfileScreen;
