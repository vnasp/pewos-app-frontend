import type { ComponentProps } from "react";

/**
 * Los controles de formulario, con el mismo aspecto en toda la app.
 *
 * Antes cada pantalla repetía la misma cadena de clases copiada a mano —ocho copias, con
 * pequeñas diferencias entre ellas— y era lo que mantenía vivo el índigo de Tailwind
 * después del rediseño. Con esto, cambiar el foco o el radio es tocar un archivo.
 */
const control =
  "w-full border border-black/10 rounded-2xl px-4 py-3 text-ink text-sm outline-none transition-shadow " +
  "placeholder:text-subtle focus:ring-2 focus:ring-brand/30 disabled:bg-canvas disabled:text-subtle";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`${control} ${className}`} />;
}

/** `bg-white` explícito: sin él, Safari le pone su propio gris al desplegable. */
export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`${control} bg-white ${className}`} />;
}

export function TextArea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${control} resize-none ${className}`} />;
}
