import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Hoja inferior con backdrop. Cierra con Escape o tocando fuera.
 *
 * Existe para dejar de usar `window.confirm`, que se ve como una alerta del navegador y
 * rompe la continuidad visual de la app.
 */
function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full lg:max-w-md bg-white rounded-t-sheet lg:rounded-sheet lg:mb-6 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-float"
      >
        <div className="w-9 h-1 rounded-full bg-line mx-auto mb-3" />
        <h2 className="text-base font-extrabold text-ink mb-3">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Sheet;
