import { useState } from "react";

import Sheet from "./Sheet";

interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` para borrados y salidas; `brand` para confirmaciones neutras. */
  tone?: "danger" | "brand";
  /**
   * Texto que hay que escribir para habilitar el botón.
   *
   * Para lo que no se puede deshacer. Obliga a leer qué se está borrando, que es
   * justo lo que un botón de confirmar a un toque de distancia no consigue.
   */
  requireText?: string;
}

/**
 * Confirmación dentro de la app, en vez de `window.confirm`.
 *
 * El diálogo nativo aparece con el nombre del navegador y sin nada de la identidad de
 * Pewos, y en móvil corta la interacción con una alerta del sistema.
 */
function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "danger",
  requireText,
}: ConfirmSheetProps) {
  const [typed, setTyped] = useState("");
  const confirmClass =
    tone === "danger"
      ? "bg-danger text-white"
      : "bg-brand-gradient text-white";

  // Se limpia al cerrar y no en un efecto sobre `open`: así el campo nunca reaparece ya
  // resuelto de la vez anterior, y no hace falta sincronizar estado con una prop.
  const close = () => {
    setTyped("");
    onClose();
  };

  const blocked = requireText !== undefined && typed.trim() !== requireText;

  return (
    <Sheet open={open} onClose={close} title={title}>
      {description && (
        <p className="text-sm text-muted font-medium -mt-1 mb-4">
          {description}
        </p>
      )}

      {requireText !== undefined && (
        <label className="block mb-4">
          <span className="text-sm text-muted font-medium">
            Escribe <span className="font-extrabold text-ink">{requireText}</span> para
            confirmar
          </span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="mt-2 w-full border border-black/10 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:ring-2 focus:ring-danger/40"
          />
        </label>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={blocked}
          onClick={() => {
            close();
            onConfirm();
          }}
          className={`w-full py-3.5 rounded-full font-extrabold text-base active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100 ${confirmClass}`}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={close}
          className="w-full py-3.5 rounded-full font-extrabold text-base text-muted active:bg-canvas transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </Sheet>
  );
}

export default ConfirmSheet;
