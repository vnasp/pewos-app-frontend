/**
 * Reparto de horarios a lo largo del día.
 *
 * Antes existía duplicado bajo dos nombres —`calcTimes` en CareContext y
 * `calculateScheduledTimes` en ExerciseContext— y las copias divergían en un caso borde:
 * si `endTime <= startTime`, una devolvía `[startTime]` y la otra `[]`. Se adopta la
 * primera, que evita que una rutina mal configurada quede sin ningún horario.
 */
export function calculateScheduledTimes(
  startTime: string,
  endTime: string,
  timesPerDay: number,
): string[] {
  if (!startTime || !endTime || timesPerDay < 1) return [];

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  if (endMin <= startMin) return [startTime];

  const interval = (endMin - startMin) / (timesPerDay - 1 || 1);
  return Array.from({ length: timesPerDay }, (_, i) => {
    const total = Math.round(startMin + interval * i);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });
}

export type TimeOfDay = "morning" | "afternoon" | "night";

export interface TimeOfDayGroup<T> {
  id: TimeOfDay;
  label: string;
  events: T[];
}

const momentos: { id: TimeOfDay; label: string; until: number }[] = [
  { id: "morning", label: "Mañana", until: 12 * 60 },
  { id: "afternoon", label: "Tarde", until: 19 * 60 },
  { id: "night", label: "Noche", until: Infinity },
];

/**
 * Reparte eventos en mañana (<12:00), tarde (12:00–18:59) y noche (>=19:00).
 *
 * Los momentos sin eventos no se devuelven, para que la pantalla no dibuje encabezados
 * huérfanos. Dentro de cada momento se respeta el orden de entrada, que en Hoy ya viene
 * ordenado por hora.
 */
export function groupByTimeOfDay<T extends { time: string }>(
  events: T[],
): TimeOfDayGroup<T>[] {
  const buckets = new Map<TimeOfDay, T[]>();

  for (const event of events) {
    const [h, m] = event.time.split(":").map(Number);
    const minutes = h * 60 + m;
    const momento = momentos.find((mo) => minutes < mo.until)!;
    const bucket = buckets.get(momento.id);
    if (bucket) bucket.push(event);
    else buckets.set(momento.id, [event]);
  }

  return momentos
    .filter((mo) => buckets.has(mo.id))
    .map((mo) => ({ id: mo.id, label: mo.label, events: buckets.get(mo.id)! }));
}

/** Horarios de un medicamento programado cada X horas. */
export function calculateTimesFromHours(startTime: string, freqHours: number): string[] {
  if (!startTime || freqHours < 1) return [];
  const [h, m] = startTime.split(":").map(Number);
  const perDay = Math.max(1, Math.floor(24 / freqHours));
  return Array.from({ length: perDay }, (_, i) => {
    const hour = (h + i * freqHours) % 24;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });
}
