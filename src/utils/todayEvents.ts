import type { Appointment, Care, Exercise, Medication } from "../types";
import type { HomeEvent } from "../types/events";
import { parseLocalDate, shortTime } from "./date";

interface DeriveInput {
  appointments: Appointment[];
  medications: Medication[];
  exercises: Exercise[];
  cares: Care[];
  /** Día a resolver, "YYYY-MM-DD". */
  todayStr: string;
  /** 0=Domingo … 6=Sábado, igual que `Date.getDay()`. */
  dayOfWeek: number;
}

/** Días entre dos fechas ISO. Negativo si `to` es anterior a `from`. */
function daysBetween(from: string, to: string): number {
  const a = parseLocalDate(from);
  const b = parseLocalDate(to);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** ¿Sigue vigente algo que termina en `endDate`? Sin fecha, nunca vence. */
function stillRunning(endDate: string | null, todayStr: string): boolean {
  return endDate === null || endDate >= todayStr;
}

/**
 * Resuelve qué recordatorios tocan en un día concreto.
 *
 * Función pura a propósito: vivía repartida en cuatro `useMemo` dentro de `HomeScreen`, donde
 * no se podía probar. Recibe el día y el día de la semana en vez de leer el reloj, para que los
 * casos borde (medicamentos cada 48h, cuidados por día de la semana) sean testeables.
 */
export function deriveTodayEvents({
  appointments,
  medications,
  exercises,
  cares,
  todayStr,
  dayOfWeek,
}: DeriveInput): HomeEvent[] {
  const todayAppointments: HomeEvent[] = appointments
    .filter((a) => a.date === todayStr)
    .map((a) => ({
      type: "appointment",
      id: a.id,
      petName: a.pet_name,
      time: shortTime(a.time),
      data: a,
    }));

  const todayMedications: HomeEvent[] = medications
    .filter((m) => {
      if (!m.is_active) return false;
      if (m.start_date > todayStr) return false;
      if (m.duration_days !== 0 && !stillRunning(m.end_date, todayStr))
        return false;
      // Intervalos mayores a 24h (p.ej. cada 48h) solo tocan algunos días.
      if (m.frequency_hours && m.frequency_hours > 24) {
        const elapsed = daysBetween(m.start_date, todayStr);
        const intervalDays = Math.round(m.frequency_hours / 24);
        if (elapsed % intervalDays !== 0) return false;
      }
      return true;
    })
    .flatMap((m) =>
      m.scheduled_times.map((raw) => {
        const time = shortTime(raw);
        return {
          type: "medication" as const,
          id: `${m.id}-${time}`,
          petName: m.pet_name,
          time,
          medicationId: m.id,
          scheduledTime: time,
          data: m,
        };
      }),
    );

  const todayExercises: HomeEvent[] = exercises
    .filter((e) => {
      if (!e.is_active) return false;
      if (e.start_date > todayStr) return false;
      if (e.is_permanent) return true;
      return stillRunning(e.end_date, todayStr);
    })
    .flatMap((e) =>
      e.scheduled_times.map((raw) => {
        const time = shortTime(raw);
        return {
          type: "exercise" as const,
          id: `${e.id}-${time}`,
          petName: e.pet_name,
          time,
          exerciseId: e.id,
          scheduledTime: time,
          data: e,
        };
      }),
    );

  const todayCares: HomeEvent[] = cares
    .filter((c) => {
      if (!c.is_active) return false;
      if (c.start_date > todayStr) return false;
      if (c.days_of_week?.length && !c.days_of_week.includes(dayOfWeek))
        return false;
      if (c.is_permanent) return true;
      return stillRunning(c.end_date, todayStr);
    })
    .flatMap((c) =>
      c.scheduled_times.map((raw) => {
        const time = shortTime(raw);
        return {
          type: "care" as const,
          id: `${c.id}-${time}`,
          petName: c.pet_name,
          time,
          careId: c.id,
          scheduledTime: time,
          data: c,
        };
      }),
    );

  return [
    ...todayAppointments,
    ...todayMedications,
    ...todayExercises,
    ...todayCares,
  ].sort((a, b) => a.time.localeCompare(b.time));
}
