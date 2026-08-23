import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  /** Explicación bajo el control. */
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

/**
 * Etiqueta, control y ayuda.
 *
 * Envuelve en `<label>` en vez de usar `htmlFor`: así no hace falta inventar un `id`
 * único por campo, y tocar el texto enfoca el control igual.
 */
export function Field({ label, hint, required, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-muted text-xs font-bold block mb-1.5">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {hint && <p className="text-subtle text-xs mt-1.5">{hint}</p>}
    </label>
  );
}

/**
 * Lo mismo, para un grupo de botones.
 *
 * Un `<label>` solo puede apuntar a un control, y envolviendo varios botones haría que el
 * lector de pantalla leyera el título en cada uno. `role="group"` los nombra de una vez.
 */
export function FieldGroup({ label, hint, required, children }: FieldProps) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-muted text-xs font-bold mb-2">
        {label}
        {required && <span className="text-danger"> *</span>}
      </p>
      {children}
      {hint && <p className="text-subtle text-xs mt-1.5">{hint}</p>}
    </div>
  );
}
