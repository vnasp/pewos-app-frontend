import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  /** `light` va sobre el degradado del header; `solid` sobre la hoja blanca. */
  tone?: "solid" | "light";
  /** Icono a la izquierda, o el avatar de una mascota. */
  leading?: ReactNode;
}

export default function Chip({
  children,
  active = false,
  count,
  onClick,
  tone = "solid",
  leading,
}: ChipProps) {
  const styles =
    tone === "light"
      ? active
        ? "bg-white text-brand-dark"
        : "bg-white/20 text-white"
      : active
        ? "bg-brand-gradient text-white"
        : "bg-canvas text-muted";

  const badge =
    tone === "light"
      ? active
        ? "bg-brand-dark/10 text-brand-dark"
        : "bg-white/25 text-white"
      : active
        ? "bg-white/25 text-white"
        : "bg-white text-subtle";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 flex items-center gap-1.5 ps-2.5 pe-3 py-1.5 rounded-full text-sm font-bold transition-colors ${styles}`}
    >
      {leading}
      <span className="whitespace-nowrap">{children}</span>
      {count !== undefined && (
        <span
          className={`text-xs font-extrabold px-1.5 rounded-full ${badge}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
