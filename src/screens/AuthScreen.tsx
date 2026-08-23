import { useEffect, useLayoutEffect, useRef, useState } from "react";

import LoginForm from "../components/auth/LoginForm";

interface AuthScreenProps {
  /** Quien ya vio la intro entra con el drawer arriba, sin volver a pedir el toque. */
  startOpen: boolean;
  onOpen: () => void;
}

/**
 * Entrada a la app: promesa y formulario en una sola vista.
 *
 * Antes eran dos pantallas —`OnboardingScreen` y `LoginScreen`— y pasar de una a otra era
 * un corte seco, pese a que ambas compartían el mismo degradado. Aquí el degradado y la
 * foto no se mueven: solo sube el drawer, y la promesa sigue visible mientras escribes.
 */
export default function AuthScreen({ startOpen, onOpen }: AuthScreenProps) {
  const [open, setOpen] = useState(startOpen);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [drawerHeight, setDrawerHeight] = useState(0);

  // El cachorro se ancla al borde del drawer, no al del viewport: si se ancla abajo,
  // el drawer lo tapa hasta dejar solo los ojos y queda un hueco de degradado en medio.
  // Se mide en vez de calcularse porque el alto cambia entre login y registro.
  useLayoutEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const update = () => setDrawerHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // La foto ocupa casi toda la pantalla y arrastrar sobre ella selecciona texto.
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("selectstart", prevent);
    return () => document.removeEventListener("selectstart", prevent);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    onOpen();
  };

  return (
    <div className="relative w-full h-svh overflow-hidden bg-brand-gradient">
      {/* Formas de fondo. Van detrás de la foto, que es transparente salvo el cachorro. */}
      <div className="absolute rounded-full bg-white/10 animate-float-up w-75 h-75 -top-37.5 -right-25" />
      <div className="absolute rounded-full bg-white/8 animate-float-down w-62.5 h-62.5 top-1/3 -left-20" />
      <div className="absolute rounded-full animate-pulse-ring w-100 h-100 top-1/2 left-1/2 bg-white/10" />
      <div
        className="absolute rounded-full animate-pulse-ring-slow w-100 h-100 top-1/2 left-1/2 bg-white/8"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Las patas quedan justo sobre el borde del drawer, como si se apoyara en él. */}
      <div
        className="absolute inset-x-0 top-0 z-10 transition-[bottom] duration-500 ease-out"
        style={{ bottom: open ? Math.max(drawerHeight - 24, 0) : 0 }}
      >
        <img
          src="/assets/onboarding.webp"
          alt=""
          className="w-full h-full object-cover object-bottom"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      {/* La promesa se retira al abrir el drawer: con el formulario arriba el protagonismo
          es del formulario, y deja aire para que se vea el cachorro entero. */}
      <div
        className={`absolute inset-x-0 top-0 z-20 px-5 pt-[env(safe-area-inset-top)] transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        inert={open}
      >
        <h1 className="pt-20 text-center text-4xl text-white leading-tight tracking-tight">
          <span className="font-medium">Toda la agenda de</span>
          <br />
          <span className="font-extrabold">tu mascota</span>
          <br />
          <span className="font-medium">en un solo lugar</span>
        </h1>
      </div>

      {/* Botón de apertura: desaparece cuando el drawer ya está arriba. */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        // Simétrico al drawer: `opacity-0` sigue siendo tabulable y visible para un lector
        // de pantalla, y quedarían dos botones "Iniciar sesión" alcanzables a la vez.
        inert={open}
      >
        <button
          type="button"
          onClick={handleOpen}
          className="w-full lg:max-w-md lg:mx-auto lg:block h-14 rounded-full bg-white text-brand-dark text-base font-extrabold shadow-float active:scale-95 transition-transform"
        >
          Iniciar sesión
        </button>
      </div>

      {/* Drawer */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-sheet shadow-float max-h-[86svh] overflow-y-auto transition-transform duration-500 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        ref={drawerRef}
        // `inert` y no `aria-hidden`: además de ocultarlo al lector de pantalla saca del
        // orden de tabulación los inputs, que si no se pueden enfocar estando fuera de vista.
        inert={!open}
      >
        <div className="px-6 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))] lg:max-w-md lg:mx-auto">
          <div className="w-9 h-1 rounded-full bg-line mx-auto mb-5" />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
