import { Calendar, Dumbbell, HeartPulse, Pill } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { EventCategory } from "../types/events";

/**
 * Única fuente de verdad para color, icono y etiqueta de cada categoría de recordatorio.
 *
 * Antes esto estaba triplicado: `appointmentTypeColors` y compañía en `labels.ts`,
 * `typeConfig` en `EventsList` e `items` en `QuickAccess`, y los tres divergían.
 *
 * El color indica la **categoría**, no el subtipo: antes una vacuna y un control se pintaban
 * distinto, lo que hacía imposible reconocer "esto es una cita" de un vistazo.
 */
export interface CategoryStyle {
  label: string;
  /** Para chips y espacios estrechos. */
  labelShort: string;
  icon: LucideIcon;
  /** Clase de color de texto. */
  fg: string;
  /** Clase de color de fondo suave. */
  soft: string;
}

export const categoryStyles: Record<EventCategory, CategoryStyle> = {
  medication: {
    label: "Medicamentos",
    labelShort: "Medic.",
    icon: Pill,
    fg: "text-med",
    soft: "bg-med-soft",
  },
  exercise: {
    label: "Ejercicios",
    labelShort: "Ejerc.",
    icon: Dumbbell,
    fg: "text-exercise",
    soft: "bg-exercise-soft",
  },
  care: {
    label: "Cuidados",
    labelShort: "Cuid.",
    icon: HeartPulse,
    fg: "text-care",
    soft: "bg-care-soft",
  },
  appointment: {
    label: "Citas",
    labelShort: "Citas",
    icon: Calendar,
    fg: "text-appointment",
    soft: "bg-appointment-soft",
  },
};

/** Orden en que se muestran los filtros de tipo y las opciones de "agregar". */
export const categoryOrder: EventCategory[] = [
  "medication",
  "exercise",
  "care",
  "appointment",
];
