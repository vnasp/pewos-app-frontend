/** Devuelve la fecha en formato YYYY-MM-DD usando la hora local (sin UTC shift) */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parsea "YYYY-MM-DD" como mediodía local para evitar el UTC-shift que
 * convierte new Date("2026-02-23") en el día anterior en zonas GMT-X.
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

/** Fecha de hoy en formato YYYY-MM-DD. */
export function today(): string {
  return formatLocalDate(new Date());
}

/** "HH:MM:SS" o "HH:MM" → "HH:MM". La API devuelve TIME con segundos. */
export function shortTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : "";
}

/** Suma días a una fecha YYYY-MM-DD y devuelve otra YYYY-MM-DD. */
export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/** Edad en años a partir de una fecha de nacimiento YYYY-MM-DD. */
export function ageInYears(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = parseLocalDate(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

/**
 * "Lunes 1 septiembre 2026".
 *
 * Usa `parseLocalDate` en vez de `new Date(str)`: este último interpreta "2026-09-01"
 * como medianoche UTC y en GMT-X muestra el día anterior.
 */
export function formatLongDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
  const month = d.toLocaleDateString("es-ES", { month: "long" });
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${capitalize(weekday)} ${d.getDate()} ${capitalize(month)} ${d.getFullYear()}`;
}

/** "01 sept 2026". */
export function formatShortDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Días entre hoy y una fecha YYYY-MM-DD. Negativo si ya pasó.
 * Sin fecha (tratamiento continuo) devuelve Infinity: nunca vence.
 */
export function daysUntil(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  const target = parseLocalDate(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
