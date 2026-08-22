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
