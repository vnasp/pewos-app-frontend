import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /**
   * `primary` para la acción principal de la pantalla, una por vista;
   * `secondary` para opciones entre las que se elige, sin jerarquía entre ellas;
   * `danger` para lo que destruye datos.
   */
  variant?: Variant;
  /** Marca la opción elegida dentro de un grupo de `secondary`. */
  selected?: boolean;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
  type?: "button" | "submit";
  leading?: ReactNode;
}

const base =
  "flex items-center justify-center gap-2 rounded-full font-extrabold text-sm py-3.5 px-5 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-brand-gradient text-white",
  // Pastel, del mismo par `soft`/color que usa `danger`.
  secondary: "bg-brand-soft text-brand",
  danger: "bg-danger-soft text-danger",
};

/**
 * La opción elegida dentro de un grupo.
 *
 * Un tono más del mismo pastel y un aro, no el degradado sólido: estar seleccionada es un
 * estado, no una llamada a la acción, y con el degradado pesaba más que el propio botón
 * de guardar de la pantalla.
 */
const SELECTED = "bg-brand/20 text-brand-dark ring-2 ring-brand ring-inset";

function Button({
  children,
  onClick,
  variant = "primary",
  selected,
  disabled,
  block,
  type = "button",
  leading,
}: ButtonProps) {
  const style = variant === "secondary" && selected ? SELECTED : variants[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Solo cuando el botón es parte de un grupo de opciones: en un botón de acción,
      // `aria-pressed` haría que el lector de pantalla lo anuncie como un interruptor.
      aria-pressed={selected}
      className={`${base} ${style} ${block ? "w-full" : ""}`}
    >
      {leading}
      {children}
    </button>
  );
}

export default Button;
