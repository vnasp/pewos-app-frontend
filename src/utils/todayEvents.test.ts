import { describe, expect, test } from "vitest";

import type { Appointment, Care, Exercise, Medication } from "../types";
import { deriveTodayEvents } from "./todayEvents";

const TODAY = "2026-08-21"; // viernes
const FRIDAY = 5;

const base = { pet_id: "p1", pet_name: "Uma", notes: null, is_active: true };

const medication = (over: Partial<Medication> = {}): Medication => ({
  ...base,
  id: "m1",
  name: "Meloxicam",
  dosage: "1 comp.",
  schedule_type: "hours",
  frequency_hours: 24,
  start_time: "08:00:00",
  start_date: TODAY,
  duration_days: 0,
  end_date: null,
  scheduled_times: ["08:00:00"],
  meal_time_ids: [],
  notification_time: "none",
  ...over,
});

const exercise = (over: Partial<Exercise> = {}): Exercise => ({
  ...base,
  id: "e1",
  type: "caminata",
  custom_type_description: null,
  duration_minutes: 20,
  times_per_day: 1,
  start_time: "09:30:00",
  end_time: "09:30:00",
  scheduled_times: ["09:30:00"],
  start_date: TODAY,
  is_permanent: true,
  duration_weeks: null,
  end_date: null,
  notification_time: "none",
  ...over,
});

const care = (over: Partial<Care> = {}): Care => ({
  ...base,
  id: "c1",
  type: "limpieza_herida",
  custom_type_description: null,
  duration_minutes: 10,
  times_per_day: 1,
  start_time: "19:00:00",
  end_time: "19:00:00",
  scheduled_times: ["19:00:00"],
  start_date: TODAY,
  is_permanent: true,
  duration_days: null,
  end_date: null,
  days_of_week: null,
  notification_time: "none",
  ...over,
});

const appointment = (over: Partial<Appointment> = {}): Appointment => ({
  ...base,
  id: "a1",
  type: "control",
  custom_type_description: null,
  date: TODAY,
  time: "16:00:00",
  notification_time: "none",
  recurrence_pattern: "none",
  recurrence_end_date: null,
  ...over,
});

const derive = (
  data: Partial<Parameters<typeof deriveTodayEvents>[0]> = {},
) =>
  deriveTodayEvents({
    appointments: [],
    medications: [],
    exercises: [],
    cares: [],
    todayStr: TODAY,
    dayOfWeek: FRIDAY,
    ...data,
  });

describe("deriveTodayEvents", () => {
  test("ordena todos los eventos del día por hora", () => {
    const events = derive({
      appointments: [appointment()],
      medications: [medication()],
      exercises: [exercise()],
      cares: [care()],
    });

    expect(events.map((e) => e.time)).toEqual([
      "08:00",
      "09:30",
      "16:00",
      "19:00",
    ]);
  });

  test("recorta los segundos de las horas que devuelve la API", () => {
    const events = derive({ medications: [medication()] });

    expect(events[0].time).toBe("08:00");
  });

  test("un medicamento con varias tomas genera un evento por toma", () => {
    const events = derive({
      medications: [
        medication({ scheduled_times: ["08:00:00", "20:00:00"] }),
      ],
    });

    expect(events.map((e) => e.time)).toEqual(["08:00", "20:00"]);
    expect(new Set(events.map((e) => e.id)).size).toBe(2);
  });

  test("descarta lo que está inactivo", () => {
    const events = derive({
      medications: [medication({ is_active: false })],
      exercises: [exercise({ is_active: false })],
      cares: [care({ is_active: false })],
    });

    expect(events).toEqual([]);
  });

  test("descarta lo que todavía no empieza", () => {
    const events = derive({
      medications: [medication({ start_date: "2026-08-22" })],
      exercises: [exercise({ start_date: "2026-08-22" })],
      cares: [care({ start_date: "2026-08-22" })],
    });

    expect(events).toEqual([]);
  });

  test("un medicamento cada 48h no aparece en el día intermedio", () => {
    const cada48h = medication({
      frequency_hours: 48,
      start_date: "2026-08-20",
    });

    expect(derive({ medications: [cada48h] })).toEqual([]);
  });

  test("un medicamento cada 48h sí aparece el día que toca", () => {
    const cada48h = medication({
      frequency_hours: 48,
      start_date: "2026-08-19",
    });

    expect(derive({ medications: [cada48h] })).toHaveLength(1);
  });

  test("un medicamento con duration_days 0 no vence nunca", () => {
    const continuo = medication({
      duration_days: 0,
      end_date: "2026-01-01",
      start_date: "2025-01-01",
    });

    expect(derive({ medications: [continuo] })).toHaveLength(1);
  });

  test("un medicamento con duración vencida no aparece", () => {
    const vencido = medication({
      duration_days: 7,
      end_date: "2026-08-20",
      start_date: "2026-08-13",
    });

    expect(derive({ medications: [vencido] })).toEqual([]);
  });

  test("un cuidado con días de la semana que no incluyen hoy no aparece", () => {
    const lunesYMiercoles = care({ days_of_week: [1, 3] });

    expect(derive({ cares: [lunesYMiercoles] })).toEqual([]);
  });

  test("un cuidado con días de la semana que incluyen hoy sí aparece", () => {
    const viernes = care({ days_of_week: [FRIDAY] });

    expect(derive({ cares: [viernes] })).toHaveLength(1);
  });

  test("un ejercicio permanente no vence aunque tenga end_date pasada", () => {
    const permanente = exercise({
      is_permanent: true,
      end_date: "2026-01-01",
      start_date: "2025-01-01",
    });

    expect(derive({ exercises: [permanente] })).toHaveLength(1);
  });

  test("un ejercicio no permanente con end_date pasada no aparece", () => {
    const terminado = exercise({
      is_permanent: false,
      end_date: "2026-08-20",
      start_date: "2026-08-01",
    });

    expect(derive({ exercises: [terminado] })).toEqual([]);
  });

  test("solo trae las citas de hoy", () => {
    const events = derive({
      appointments: [appointment(), appointment({ id: "a2", date: "2026-08-22" })],
    });

    expect(events).toHaveLength(1);
    expect(events[0].data.id).toBe("a1");
  });

  test("cada evento sabe su categoría y su mascota", () => {
    const events = derive({ medications: [medication()] });

    expect(events[0].type).toBe("medication");
    expect(events[0].petName).toBe("Uma");
    expect(events[0].data.pet_id).toBe("p1");
  });

  test("los eventos no-cita llevan la hora programada para poder marcarse", () => {
    const events = derive({ medications: [medication()] });

    expect(events[0]).toMatchObject({
      type: "medication",
      medicationId: "m1",
      scheduledTime: "08:00",
    });
  });
});

describe("mascotas archivadas", () => {
  const archivedPetIds = new Set(["p1"]);

  test("una mascota archivada no genera ningún recordatorio", () => {
    const events = derive({
      appointments: [appointment()],
      medications: [medication()],
      exercises: [exercise()],
      cares: [care()],
      archivedPetIds,
    });

    expect(events).toEqual([]);
  });

  test("las citas también se van, aunque no tengan is_active con el que apagarse", () => {
    const events = derive({ appointments: [appointment()], archivedPetIds });

    expect(events).toEqual([]);
  });

  test("no se filtra por mascota una pauta reactivada a mano", () => {
    // El filtro es por mascota y no por `is_active`: encender una medicación de una
    // mascota archivada no puede devolverla a los recordatorios de hoy.
    const events = derive({
      medications: [medication({ is_active: true })],
      archivedPetIds,
    });

    expect(events).toEqual([]);
  });

  test("las mascotas activas siguen recordando con normalidad", () => {
    const events = derive({
      medications: [medication(), medication({ pet_id: "p2", pet_name: "Nube" })],
      archivedPetIds,
    });

    expect(events.map((e) => e.petName)).toEqual(["Nube"]);
  });

  test("sin archivadas, no cambia nada", () => {
    const events = derive({ medications: [medication()], archivedPetIds: new Set() });

    expect(events).toHaveLength(1);
  });
});
