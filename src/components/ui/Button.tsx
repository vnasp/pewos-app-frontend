import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md";

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
  /** `sm` para las opciones que van en fila —"6h", "30 días"—, que no son la acción
   *  principal y con el tamaño normal ocupaban más que el botón de guardar. */
  size?: Size;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
  type?: "button" | "submit";
  leading?: ReactNode;
  /**
   * El nombre completo cuando el texto visible es una abreviatura.
   *
   * Sirve de tooltip y de nombre accesible: un botón que solo dice "L" se anuncia como
   * "L", que no le dice nada a quien no ve la fila entera.
   */
  title?: string;
}

const base =
  "flex items-center justify-center gap-2 rounded-full font-extrabold transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100";

const sizes: Record<Size, string> = {
  sm: "text-sm py-2 px-3.5",
  md: "text-sm py-3.5 px-5",
};

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
  size = "md",
  disabled,
  block,
  type = "button",
  leading,
  title,
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
      title={title}
      aria-label={title}
      className={`${base} ${sizes[size]} ${style} ${block ? "w-full" : ""}`}
    >
      {leading}
      {children}
    </button>
  );
}

export default Button;
