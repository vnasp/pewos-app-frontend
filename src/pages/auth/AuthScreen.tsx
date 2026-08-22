import { useCallback, useEffect, useState } from "react";

import AuthDrawer from "../../components/auth/AuthDrawer";
import type { DrawerGeometry } from "../../components/auth/AuthDrawer";
import AuthHeadline from "../../components/auth/AuthHeadline";
import FloatingShapes from "../../components/auth/FloatingShapes";
import LoginForm from "../../components/auth/LoginForm";
import PuppyPhoto from "../../components/auth/PuppyPhoto";
import { useAuth } from "../../context/AuthContext";

interface AuthScreenProps {
  /** La portada quedó atrás: al tocar "Continuar" con sesión, o al autenticarse sin ella. */
  onIntroSeen: () => void;
}

/**
 * Portada de la app: la promesa, el cachorro y una sola acción.
 *
 * Se muestra en cada arranque, haya sesión o no. Antes se saltaba con una marca en
 * `localStorage` y quien volvía a la app no la veía nunca más.
 *
 * El formulario vive en la misma vista, dentro de un drawer: al abrirlo el degradado no
 * se mueve, solo sube la hoja y el cachorro se apoya en su borde.
 */
function AuthScreen({ onIntroSeen }: AuthScreenProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [geometry, setGeometry] = useState<DrawerGeometry>({
    visibleHeight: 0,
    dragging: false,
  });

  const close = useCallback(() => setOpen(false), []);

  // Haber iniciado sesión con el drawer abierto significa que se autenticó aquí mismo:
  // se entra solo, sin devolver a la portada a tocar "Continuar".
  useEffect(() => {
    if (user && open) onIntroSeen();
  }, [user, open, onIntroSeen]);

  return (
    <div className="relative w-full h-svh overflow-hidden bg-brand-gradient">
      <FloatingShapes />
      <PuppyPhoto
        restingOn={open ? geometry.visibleHeight : 0}
        animated={!geometry.dragging}
      />
      <AuthHeadline hidden={open} />

      {/* Tocar al cachorro cierra la hoja. Fuera del árbol de accesibilidad a propósito:
          es una comodidad de dedo, el control que se anuncia es el asa del drawer. */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={close}
          className="absolute inset-x-0 top-0 z-20"
          style={{ bottom: geometry.visibleHeight }}
        />
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        // Simétrico al drawer: `opacity-0` sigue siendo tabulable y visible para un lector
        // de pantalla, y quedarían dos botones alcanzables a la vez.
        inert={open}
      >
        <button
          type="button"
          onClick={() => (user ? onIntroSeen() : setOpen(true))}
          className="w-full lg:max-w-md lg:mx-auto lg:block h-14 rounded-full bg-white text-brand-dark text-base font-extrabold shadow-float active:scale-95 transition-transform"
        >
          {user ? "Continuar" : "Iniciar sesión"}
        </button>
      </div>

      <AuthDrawer open={open} onClose={close} onGeometryChange={setGeometry}>
        <LoginForm />
      </AuthDrawer>
    </div>
  );
}

export default AuthScreen;
