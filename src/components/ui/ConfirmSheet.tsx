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
}: ConfirmSheetProps) {
  const confirmClass =
    tone === "danger"
      ? "bg-danger text-white"
      : "bg-brand-gradient text-white";

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {description && (
        <p className="text-sm text-muted font-medium -mt-1 mb-4">
          {description}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onConfirm();
          }}
          className={`w-full py-3.5 rounded-full font-extrabold text-base active:scale-95 transition-transform ${confirmClass}`}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-full font-extrabold text-base text-muted active:bg-canvas transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </Sheet>
  );
}

export default ConfirmSheet;
