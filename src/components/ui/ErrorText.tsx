import type { ReactNode } from "react";

interface ErrorTextProps {
  children: ReactNode;
}

/**
 * El error de una pantalla.
 *
 * `role="alert"` lo hace anunciarse solo: el mensaje aparece lejos del botón que lo
 * provocó y quien navega con lector de pantalla no tiene por qué ir a buscarlo.
 */
function ErrorText({ children }: ErrorTextProps) {
  if (!children) return null;

  return (
    <p
      role="alert"
      className="text-danger text-sm font-medium bg-danger-soft rounded-2xl px-3.5 py-2.5"
    >
      {children}
    </p>
  );
}

export default ErrorText;
