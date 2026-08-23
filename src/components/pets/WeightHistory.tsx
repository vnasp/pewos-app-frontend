import { ArrowDownRight, ArrowUpRight, Minus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { PetWeight } from "../../types";
import { formatShortDate } from "../../utils/date";
import ConfirmSheet from "../ui/ConfirmSheet";

interface WeightHistoryProps {
  /** Como los devuelve la API: del pesaje más reciente al más antiguo. */
  entries: PetWeight[];
  onDelete: (weightId: string) => void;
  canWrite: boolean;
}

/** Sin plegar solo cabe una pauta corta; el resto se pide. */
const VISIBLE = 5;

/** Llega como texto para que el decimal no pase por un float en el JSON. */
const kg = (entry: PetWeight) => Number(entry.weight_kg);

const format = (value: number) =>
  value.toLocaleString("es-CL", { maximumFractionDigits: 2 });

/**
 * La curva del peso.
 *
 * Sin ejes ni números: para eso está la lista de abajo. Lo que aporta es la forma —si
 * sube, si baja, si lleva meses plano—, que en una columna de cifras cuesta ver.
 */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  // Todos los pesajes iguales darían una división por cero; la línea queda centrada.
  const span = max - min || 1;
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 26 - ((value - min) / span) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 28"
      // El viewBox se estira al ancho disponible; sin esto el trazo se estiraría con él.
      preserveAspectRatio="none"
      className="w-full h-8 text-brand"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Cuánto cambió respecto del pesaje anterior.
 *
 * En gris y no en verde o rojo: en una mascota subir o bajar de peso no es bueno ni malo
 * por sí solo —depende de si es un cachorro, de si está a dieta, de qué dijo el
 * veterinario—, y pintarlo sería opinar sobre algo que no sabemos.
 */
function Delta({ change }: { change: number }) {
  const rounded = Math.round(change * 100) / 100;

  if (rounded === 0) {
    return (
      <span className="flex items-center gap-1 text-subtle text-xs font-bold shrink-0">
        <Minus size={13} aria-hidden />
        igual
      </span>
    );
  }

  const Icon = rounded > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="flex items-center gap-1 text-subtle text-xs font-bold shrink-0">
      <Icon size={13} aria-hidden />
      {rounded > 0 ? "+" : "−"}
      {format(Math.abs(rounded))} kg
    </span>
  );
}

function WeightHistory({ entries, onDelete, canWrite }: WeightHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [toDelete, setToDelete] = useState<PetWeight | null>(null);

  if (entries.length === 0) return null;

  const shown = expanded ? entries : entries.slice(0, VISIBLE);
  const hidden = entries.length - shown.length;

  return (
    <section>
      <h3 className="text-muted text-xs font-bold mb-2">
        Historial de peso ({entries.length})
      </h3>

      <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
        {entries.length > 1 && (
          <div className="px-4 pt-4 pb-1">
            {/* Al derecho en el tiempo: la lista va del más nuevo al más viejo, que es lo
                que se quiere leer, pero una curva que avanza hacia atrás no se entiende. */}
            <Sparkline values={[...entries].reverse().map(kg)} />
          </div>
        )}

        <ul>
          {shown.map((entry, i) => {
            // `entries` y no `shown`: el último visible sí tiene anterior, solo que
            // plegado, y sin esto aparecería como si fuera el primer pesaje.
            const index = entries.indexOf(entry);
            const previous = entries[index + 1];

            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-ink font-bold text-sm">{format(kg(entry))} kg</p>
                  <p className="text-subtle text-xs">{formatShortDate(entry.recorded_on)}</p>
                </div>

                {previous && <Delta change={kg(entry) - kg(previous)} />}

                {canWrite && (
                  <button
                    type="button"
                    onClick={() => setToDelete(entry)}
                    aria-label={`Eliminar el pesaje del ${formatShortDate(entry.recorded_on)}`}
                    className="w-8 h-8 bg-danger-soft rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <Trash2 size={14} className="text-danger" aria-hidden />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full border-t border-line py-3 text-brand font-bold text-sm active:bg-canvas transition-colors"
          >
            Ver los {hidden} anteriores
          </button>
        )}
      </div>

      <ConfirmSheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && onDelete(toDelete.id)}
        title="¿Eliminar este pesaje?"
        description={
          toDelete
            ? `Se borra el registro de ${format(kg(toDelete))} kg del ${formatShortDate(toDelete.recorded_on)}. El resto del historial no se toca.`
            : ""
        }
        confirmLabel="Eliminar"
      />
    </section>
  );
}

export default WeightHistory;
