import { useState } from "react";

import { ApiError } from "../../api";
import Button from "../../components/ui/Button";
import ErrorText from "../../components/ui/ErrorText";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

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
      <ErrorText>{error}</ErrorText>

      <section>
        <h3 className="text-subtle text-xs font-bold uppercase tracking-wide mb-2">
          Tu nombre
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-line flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Nombre">
                <Input
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="Ana"
                  maxLength={80}
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Apellido">
                <Input
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="Pérez"
                  maxLength={80}
                />
              </Field>
            </div>
          </div>
          <p className="text-xs text-subtle -mt-1">
            Al marcar algo como hecho aparece solo tu nombre.
          </p>
          <Button
            block
            disabled={unchanged}
            onClick={() =>
              run(async () => {
                await updateProfile({
                  first_name: firstName.trim(),
                  last_name: lastName.trim(),
                });
                setSaved(true);
              })
            }
          >
            {saved ? "Guardado" : "Guardar nombre"}
          </Button>
        </div>
      </section>

      <section>
        <h3 className="text-subtle text-xs font-bold uppercase tracking-wide mb-2">
          Tu cuenta
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-line">
          <p className="text-muted text-xs font-bold mb-1">Correo</p>
          <p className="text-ink text-sm break-all">{user?.email}</p>
          <p className="text-xs text-subtle mt-2">
            Identifica tu cuenta y no se puede cambiar. Es lo que se muestra a los demás
            mientras no pongas tu nombre.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-subtle text-xs font-bold uppercase tracking-wide mb-2">
          Unirme a otro grupo
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-card border border-line flex gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Pega el código aquí"
            className="flex-1"
          />
          <Button
            disabled={!joinCode.trim()}
            onClick={() =>
              run(async () => {
                await redeemInvitation(joinCode.trim());
                setJoinCode("");
              })
            }
          >
            Unirme
          </Button>
        </div>
      </section>
    </div>
  );
}

export default ProfileScreen;
