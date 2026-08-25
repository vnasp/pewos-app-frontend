import { useIsDesktop } from "../../hooks/useIsDesktop";
import AuthPortrait from "./AuthPortrait";
import AuthSplit from "./AuthSplit";

interface AuthScreenProps {
  /** La portada quedó atrás: al tocar "Continuar" con sesión, o al autenticarse sin ella. */
  onIntroSeen: () => void;
}

/**
 * Portada de la app: la promesa, el cachorro y la entrada a la cuenta.
 *
 * Se muestra en cada arranque, haya sesión o no. Antes se saltaba con una marca en
 * `localStorage` y quien volvía a la app no la veía nunca más.
 *
 * Son dos pantallas, no una con clases responsive: en móvil el formulario sube en un
 * drawer arrastrable y en escritorio vive a la vista, en su propia columna. Montar las
 * dos a la vez dejaría dos `LoginForm` en el DOM, con dos `id="email"` y los `<label>`
 * apuntando al campo equivocado.
 */
function AuthScreen({ onIntroSeen }: AuthScreenProps) {
  return useIsDesktop() ? (
    <AuthSplit onIntroSeen={onIntroSeen} />
  ) : (
    <AuthPortrait onIntroSeen={onIntroSeen} />
  );
}

export default AuthScreen;
