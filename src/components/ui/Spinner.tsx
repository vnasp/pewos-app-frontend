interface SpinnerProps {
  /** `brand` sobre fondo claro, `light` sobre el degradado. */
  tone?: "brand" | "light";
  size?: "md" | "lg";
  className?: string;
}

export default function Spinner({
  tone = "brand",
  size = "md",
  className = "",
}: SpinnerProps) {
  const dimensions = size === "lg" ? "w-10 h-10 border-4" : "w-8 h-8 border-4";
  const color =
    tone === "light"
      ? "border-white border-t-transparent"
      : "border-brand border-t-transparent";

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`${dimensions} ${color} rounded-full animate-spin ${className}`}
    />
  );
}
