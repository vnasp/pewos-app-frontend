import { useEffect } from "react";

/** Cuánto asoman las patas por debajo del borde del drawer, como si se apoyara en él. */
const PAW_OVERLAP = 42;

interface PuppyPhotoProps {
  /** Alto del borde sobre el que se apoya, medido desde abajo. 0 = el del viewport. */
  restingOn: number;
  /** Se apaga durante el arrastre: con transición el cachorro va por detrás del dedo. */
  animated: boolean;
}

/**
 * El cachorro de la portada, anclado al borde del drawer y no al del viewport.
 *
 * Si se ancla abajo, el drawer lo tapa hasta dejar solo los ojos y queda un hueco de
 * degradado en medio.
 */
function PuppyPhoto({ restingOn, animated }: PuppyPhotoProps) {
  // La foto ocupa casi toda la pantalla y arrastrar sobre ella selecciona texto.
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("selectstart", prevent);
    return () => document.removeEventListener("selectstart", prevent);
  }, []);

  return (
    <div
      className={`absolute inset-x-0 top-0 z-10 ${
        animated ? "transition-[bottom] duration-500 ease-out" : ""
      }`}
      style={{ bottom: Math.max(restingOn - PAW_OVERLAP, 0) }}
    >
      <img
        src="/assets/onboarding.webp"
        alt=""
        className="w-full h-full object-cover object-bottom"
        fetchPriority="high"
        draggable={false}
      />
    </div>
  );
}

export default PuppyPhoto;
