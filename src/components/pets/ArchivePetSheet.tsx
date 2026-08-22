import { useState } from "react";

import { archiveReasonLabels } from "../../constants/labels";
import type { ArchiveReason } from "../../types";
import { today } from "../../utils/date";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

interface ArchivePetSheetProps {
  open: boolean;
  petName: string;
  onClose: () => void;
  onConfirm: (reason: ArchiveReason, on: string) => void;
}

const reasons: ArchiveReason[] = ["deceased", "rehomed", "other"];

/**
 * Retirar una mascota sin borrarla.
 *
 * Pide el motivo porque cambia cómo lo cuenta la app después: una mascota que falleció y
 * una que se mudó no merecen la misma frase. No pide confirmación escrita como el
 * borrado, porque esto no destruye nada y se deshace con un toque.
 */
function ArchivePetSheet({ open, petName, onClose, onConfirm }: ArchivePetSheetProps) {
  const [reason, setReason] = useState<ArchiveReason>("deceased");
  const [date, setDate] = useState(today());

  return (
    <Sheet open={open} onClose={onClose} title={`${petName} ya no está contigo`}>
      <p className="text-sm text-muted font-medium -mt-1 mb-4">
        Guardamos su ficha, sus fotos y todo su historial. Deja de aparecer en los
        recordatorios de hoy y sus medicamentos y rutinas quedan desactivados.
      </p>

      <div className="flex flex-col gap-2 mb-4">
        {reasons.map((option) => (
          <Button
            key={option}
            variant="secondary"
            selected={reason === option}
            onClick={() => setReason(option)}
            block
          >
            {archiveReasonLabels[option]}
          </Button>
        ))}
      </div>

      <label className="block mb-4">
        <span className="text-sm text-muted font-medium">¿Desde cuándo?</span>
        <input
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full border border-black/10 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:ring-2 focus:ring-brand/30"
        />
      </label>

      <div className="flex flex-col gap-2">
        <Button
          block
          onClick={() => {
            onClose();
            onConfirm(reason, date);
          }}
        >
          Guardar
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-full font-extrabold text-base text-muted active:bg-canvas transition-colors"
        >
          Cancelar
        </button>
      </div>
    </Sheet>
  );
}

export default ArchivePetSheet;
