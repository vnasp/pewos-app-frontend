import { useState } from "react";
import {
  Calendar,
  Pill,
  Dumbbell,
  HeartPulse,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Pet, Completion } from "../../types";
import type { HomeEvent } from "./types";
import { appointmentTypeLabels, careTypeLabels, exerciseTypeLabels } from "../../constants/labels";

interface EventsListProps {
  events: HomeEvent[];
  completionFor: (ev: HomeEvent) => Completion | undefined;
  selectedPetId: string | null;
  pets: Pet[];
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
  // exercise
  if (ev.data.type === "otro" && ev.data.custom_type_description)
    return ev.data.custom_type_description;
  return exerciseTypeLabels[ev.data.type] ?? ev.data.type;
}

function getExtraInfo(ev: HomeEvent): string | null {
  if (ev.type === "medication") return ev.data.dosage ?? null;
  if (ev.type === "exercise") return `${ev.data.duration_minutes} min`;
  if (ev.type === "care") return `${ev.data.duration_minutes} min`;
  return null;
}

const typeConfig = {
  appointment: { icon: Calendar, bg: "bg-blue-100", color: "text-blue-700" },
  medication: { icon: Pill, bg: "bg-pink-100", color: "text-pink-700" },
  exercise: { icon: Dumbbell, bg: "bg-green-100", color: "text-green-700" },
  care: { icon: HeartPulse, bg: "bg-rose-100", color: "text-rose-700" },
};

export default function EventsList({
  events,
  completionFor,
  selectedPetId,
  pets,
  canWrite,
  onToggle,
}: EventsListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const petName = selectedPetId
    ? (pets.find((d) => d.id === selectedPetId)?.name ?? "")
    : null;

  const doneCount = events.filter((ev) => completionFor(ev)).length;
  const pendingCount = events.length - doneCount;
  const visibleEvents = showCompleted
    ? events
    : events.filter((ev) => !completionFor(ev));

  const heading =
    events.length === 0
      ? petName
        ? `Sin recordatorios para ${petName}`
        : "Sin recordatorios para hoy"
      : `${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}${
          petName ? ` · ${petName}` : " hoy"
        }`;

  return (
    <div className="px-5 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-gray-800 font-bold text-base">{heading}</h2>
        {doneCount > 0 && (
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showCompleted ? (
              <>
                <EyeOff size={14} />
                <span>Ocultar completados</span>
              </>
            ) : (
              <>
                <Eye size={14} />
                <span>
                  {doneCount} completado{doneCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <CheckCircle2 size={64} strokeWidth={1.5} />
          <p className="mt-4 text-sm text-center">¡Todo tranquilo por hoy!</p>
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <CheckCircle2
            size={48}
            strokeWidth={1.5}
            className="text-green-400"
          />
          <p className="mt-3 text-sm text-center font-medium text-green-600">
            ¡Todo completado!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((ev) => {
            const cfg = typeConfig[ev.type];
            const Icon = cfg.icon;
            const completion = completionFor(ev);
            const isDone = !!completion;
            const extraInfo = getExtraInfo(ev);
            const notes = ev.data.notes ?? null;

            return (
              <div
                key={ev.id}
                className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 ${isDone ? "opacity-50" : ""}`}
              >
                <div
                  className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}
                >
                  <Icon size={20} className={cfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm text-gray-900 truncate ${isDone ? "line-through" : ""}`}
                  >
                    {getLabel(ev)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedPetId ? ev.time : `${ev.petName} · ${ev.time}`}
                    {extraInfo && ` · ${extraInfo}`}
                  </p>
                  {notes && (
                    <p className="text-xs text-gray-400 truncate mt-0.5 italic">
                      {notes}
                    </p>
                  )}
                  {completion?.completed_by_name && (
                    <p className="text-xs text-green-600 truncate mt-0.5">
                      Marcado por {completion.completed_by_name}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onToggle(ev)}
                  disabled={!canWrite}
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:active:scale-100 disabled:opacity-60 ${
                    isDone ? "bg-green-500" : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  <Check size={20} className="text-white" strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
