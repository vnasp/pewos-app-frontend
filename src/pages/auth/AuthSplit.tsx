import { useEffect, useRef } from "react";

import AuthPoster from "../../components/auth/AuthPoster";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../context/AuthContext";
import { fullName } from "../../utils/name";

interface AuthSplitProps {
  /** La portada quedó atrás: al tocar "Continuar" con sesión, o al autenticarse sin ella. */
  onIntroSeen: () => void;
}

/**
 * La portada en escritorio: el formulario a la izquierda y el cartel de la app a la derecha.
 *
 * No hay drawer ni paso previo. En una ventana ancha esconder el formulario detrás de un
 * botón solo añade un clic: cabe entero al lado del cartel sin quitarle sitio.
 */
function AuthSplit({ onIntroSeen }: AuthSplitProps) {
  const { user } = useAuth();

  // Al montar solo hay dos casos: hay sesión —y toca "Continuar"— o no la hay —y toca el
  // formulario—. Que aparezca después solo puede venir del formulario de esta columna, y
  // entonces sí se entra solo. Sin esta marca, quien ya tiene sesión pasaría de largo y
  // no llegaría a ver su propia portada.
  const startedSignedIn = useRef(user !== null);

  useEffect(() => {
    if (user && !startedSignedIn.current) onIntroSeen();
  }, [user, onIntroSeen]);

  return (
    <div className="grid grid-cols-2 w-full h-svh">
      {/* El scroll va en la columna y no en la página: el cartel de al lado se queda
          quieto. `min-h-full` sobre el hijo en vez de `justify-center` sobre el contenedor
          porque, centrando desde el flex, lo que desborda por arriba queda inalcanzable. */}
      <div className="h-full overflow-y-auto bg-white">
        <div className="min-h-full flex flex-col justify-center px-8 xl:px-12 py-12">
          <div className="w-full max-w-sm mx-auto">
            <div className="flex items-center gap-2.5 mb-10">
              <img src="/assets/icon.webp" alt="" className="w-10 h-10" />
              <span className="text-xl font-extrabold text-ink tracking-tight">
                Pewos
              </span>
            </div>

            {user ? (
              <>
                <h2 className="text-3xl font-extrabold text-ink tracking-tight">
                  ¡Hola de nuevo!
                </h2>
                <p className="text-muted mt-2 mb-8 break-words">{fullName(user)}</p>
                <button
                  type="button"
                  onClick={onIntroSeen}
                  className="w-full bg-brand-gradient text-white font-extrabold py-4 rounded-full text-base shadow-fab transition-transform active:scale-95"
                >
                  Continuar
                </button>
              </>
            ) : (
              <LoginForm />
            )}
          </div>
        </div>
      </div>

      <AuthPoster />
    </div>
  );
}

export default AuthSplit;
