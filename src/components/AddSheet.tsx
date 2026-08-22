import { PawPrint } from "lucide-react";

import { categoryStyles } from "../constants/categories";
import type { SubScreen } from "../navigation";
import type { EventCategory } from "../types/events";
import Sheet from "./ui/Sheet";

interface AddSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (target: SubScreen) => void;
}

const options: { category: EventCategory; label: string; target: SubScreen }[] =
  [
    {
      category: "medication",
      label: "Medicamento",
      target: { kind: "addEditMedication" },
    },
    {
      category: "appointment",
      label: "Cita veterinaria",
      target: { kind: "addEditAppointment" },
    },
    {
      category: "exercise",
      label: "Rutina de ejercicio",
      target: { kind: "addEditExercise" },
    },
    {
      category: "care",
      label: "Cuidado operatorio",
      target: { kind: "addEditCare" },
    },
  ];

/**
 * Qué agregar desde la pantalla de Hoy.
 *
 * El resto de pantallas listan una sola cosa, así que su "+" crea directo. Hoy mezcla las
 * cuatro categorías y no hay una respuesta única, así que pregunta.
 */
export default function AddSheet({ open, onClose, onSelect }: AddSheetProps) {
  const choose = (target: SubScreen) => {
    onClose();
    onSelect(target);
  };

  return (
    <Sheet open={open} onClose={onClose} title="¿Qué quieres agregar?">
      <div className="flex flex-col gap-1">
        {options.map(({ category, label, target }) => {
          const { icon: Icon, fg, soft } = categoryStyles[category];
          return (
            <button
              key={label}
              type="button"
              onClick={() => choose(target)}
              className="flex items-center gap-3 rounded-tile px-2 py-2.5 text-start active:bg-canvas transition-colors"
            >
              <span
                className={`w-10 h-10 ${soft} rounded-tile flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className={fg} aria-hidden />
              </span>
              <span className="text-sm font-bold text-ink">{label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => choose({ kind: "addEditPet" })}
          className="flex items-center gap-3 rounded-tile px-2 py-2.5 text-start active:bg-canvas transition-colors"
        >
          <span className="w-10 h-10 bg-brand-soft rounded-tile flex items-center justify-center shrink-0">
            <PawPrint size={18} className="text-brand" aria-hidden />
          </span>
          <span className="text-sm font-bold text-ink">Mascota</span>
        </button>
      </div>
    </Sheet>
  );
}
