import { useState } from "react";
import { Check, CheckCircle2, Eye, EyeOff, PartyPopper } from "lucide-react";

import {
  appointmentTypeLabels,
  careTypeLabels,
  exerciseTypeLabels,
} from "../../constants/labels";
import type { Completion } from "../../types";
import type { HomeEvent } from "../../types/events";
import { groupByTimeOfDay } from "../../utils/schedule";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import IconBubble from "../ui/IconBubble";

interface EventsListProps {
  events: HomeEvent[];
  completionFor: (ev: HomeEvent) => Completion | undefined;
  showPetName: boolean;
  canWrite: boolean;
  onToggle: (ev: HomeEvent) => void;
}

function getLabel(ev: HomeEvent): string {
  if (ev.type === "appointment")
    return appointmentTypeLabels[ev.data.type] ?? ev.data.type;
  if (ev.type === "medication") return ev.data.name;
  if (ev.type === "care") {
    if (ev.data.type === "otro" && ev.data.custom_type_description)
      return ev.data.custom_type_description;
    return careTypeLabels[ev.data.type] ?? ev.data.type;
  }
  if (ev.data.type === "otro" && ev.data.custom_type_description)
    return ev.data.custom_type_description;
  return exerciseTypeLabels[ev.data.type] ?? ev.data.type;
}

function getExtraInfo(ev: HomeEvent): string | null {
  if (ev.type === "medication") return ev.data.dosage ?? null;
  if (ev.type === "exercise" || ev.type === "care")
    return `${ev.data.duration_minutes} min`;
  return null;
}

function EventsList({
  events,
  completionFor,
  showPetName,
  canWrite,
  onToggle,
}: EventsListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const doneCount = events.filter((ev) => completionFor(ev)).length;
  const visibleEvents = showCompleted
    ? events
    : events.filter((ev) => !completionFor(ev));

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="¡Todo tranquilo por hoy!"
        description="No hay recordatorios que coincidan con este filtro."
      />
    );
  }

  const groups = groupByTimeOfDay(visibleEvents);

  // pb-28: hueco para que el FAB flotante no tape la última tarjeta.
  return (
    <div className="px-5 pb-28">
      {doneCount > 0 && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-bold text-subtle active:text-muted transition-colors"
          >
            {showCompleted ? (
              <>
                <EyeOff size={14} aria-hidden />
                <span>Ocultar completados</span>
              </>
            ) : (
              <>
                <Eye size={14} aria-hidden />
                <span>
                  {doneCount} completado{doneCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="¡Todo completado!"
          description="No queda nada pendiente para hoy."
          tone="success"
        />
      ) : (
        groups.map((group) => (
          <section key={group.id} className="mb-5 last:mb-0">
            <h2 className="flex items-center gap-3 mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.13em] text-subtle">
              {group.label}
              <span className="flex-1 h-px bg-line" />
            </h2>

            <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 xl:grid-cols-3">
              {group.events.map((ev) => {
                const completion = completionFor(ev);
                const isDone = !!completion;
                const extraInfo = getExtraInfo(ev);
                const notes = ev.data.notes ?? null;

                return (
                  <Card
                    key={ev.id}
                    dimmed={isDone}
                    className="p-3 flex items-center gap-3"
                  >
                    <IconBubble category={ev.type} />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm text-ink truncate ${isDone ? "line-through" : ""}`}
                      >
                        {getLabel(ev)}
                      </p>
                      <p className="text-xs font-semibold text-muted">
                        {showPetName ? `${ev.petName} · ${ev.time}` : ev.time}
                        {extraInfo && ` · ${extraInfo}`}
                      </p>
                      {notes && (
                        <p className="text-xs text-subtle truncate mt-0.5 italic">
                          {notes}
                        </p>
                      )}
                      {completion?.completed_by_name && (
                        <p className="text-xs font-semibold text-success truncate mt-0.5">
                          Marcado por {completion.completed_by_name}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggle(ev)}
                      disabled={!canWrite}
                      aria-pressed={isDone}
                      aria-label={
                        isDone
                          ? `Desmarcar ${getLabel(ev)}`
                          : `Marcar ${getLabel(ev)} como hecho`
                      }
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:active:scale-100 disabled:opacity-50 ${
                        isDone
                          ? "bg-success text-white"
                          : "bg-canvas text-subtle border border-line"
                      }`}
                    >
                      <Check size={18} strokeWidth={3} aria-hidden />
                    </button>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default EventsList;
