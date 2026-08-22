import { useEffect } from "react";

interface Props {
  onContinue: () => void;
}

export default function OnboardingScreen({ onContinue }: Props) {
  // La foto ocupa casi toda la pantalla y arrastrar sobre ella selecciona texto.
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("selectstart", prevent);
    return () => document.removeEventListener("selectstart", prevent);
  }, []);

  return (
    <div className="relative w-full h-svh overflow-hidden flex flex-col bg-brand-gradient">
      {/* Formas de fondo. Van detrás de la foto, que es transparente salvo el cachorro. */}
      <div className="absolute rounded-full bg-white/10 animate-float-up w-75 h-75 -top-37.5 -right-25" />
      <div className="absolute rounded-full bg-white/8 animate-float-down w-62.5 h-62.5 top-1/3 -left-20" />
      <div className="absolute rounded-full animate-pulse-ring w-100 h-100 top-1/2 left-1/2 bg-white/10" />
      <div
        className="absolute rounded-full animate-pulse-ring-slow w-100 h-100 top-1/2 left-1/2 bg-white/8"
        style={{ animationDelay: "1.5s" }}
      />

      <img
        src="/assets/onboarding.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-10"
        fetchPriority="high"
        draggable={false}
      />

      <div className="relative flex flex-col flex-1 px-5 pt-[env(safe-area-inset-top)] z-10">
        <div className="flex-1 pt-28 text-center">
          <h1 className="text-4xl font-medium text-white leading-tight tracking-tight">
            Toda la agenda de
            <br />
            <span className="font-extrabold">tu mascota</span>
            <br />
            en un solo lugar
          </h1>
        </div>

        <div className="px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onContinue}
            className="w-full lg:max-w-md lg:mx-auto lg:block h-14 rounded-full bg-white text-brand-dark text-base font-extrabold shadow-float active:scale-95 transition-transform"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
