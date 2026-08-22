import { useEffect } from "react";

import { useAppointments, useCares, useExercises, useMedications } from "./queries";
import {
  type ScheduledNotification,
  notificationsGranted,
  sendScheduleToSW,
  timeStringToTimestamp,
  notificationMinutesFor,
} from "../utils/notifications";
import { careTypeLabels, exerciseTypeLabels } from "../constants/labels";
import { daysUntil, parseLocalDate, shortTime, today } from "../utils/date";

function todayTs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function useNotificationScheduler() {
  const { items: appointments } = useAppointments();
  const { items: medications } = useMedications();
  const { items: exercises } = useExercises();
  const { items: cares } = useCares();

  useEffect(() => {
    if (!notificationsGranted()) return;

    const now = todayTs();
    const todayStr = today();
    const MS_PER_DAY = 86_400_000;
    const notifications: ScheduledNotification[] = [];

    // ── Citas de hoy ──────────────────────────────────────────────────────
    for (const apt of appointments) {
      if (apt.notification_time === "none") continue;

      const dates: Date[] = [];

      if (apt.date === todayStr) {
        dates.push(parseLocalDate(apt.date));
      } else if (apt.recurrence_pattern && apt.recurrence_pattern !== "none") {
        // Verificar si la recurrencia cae hoy
        const base = parseLocalDate(apt.date);
        base.setHours(0, 0, 0, 0);
        const diffDays = Math.round((now - base.getTime()) / MS_PER_DAY);
        let matches = false;
        if (apt.recurrence_pattern === "daily" && diffDays >= 0) matches = true;
        if (
          apt.recurrence_pattern === "weekly" &&
          diffDays >= 0 &&
          diffDays % 7 === 0
        )
          matches = true;
        if (
          apt.recurrence_pattern === "biweekly" &&
          diffDays >= 0 &&
          diffDays % 14 === 0
        )
          matches = true;
        if (apt.recurrence_pattern === "monthly") {
          const today = new Date();
          matches = diffDays >= 0 && base.getDate() === today.getDate();
        }
        if (matches) dates.push(parseLocalDate(apt.date));
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _date of dates) {
        const mins = notificationMinutesFor(apt.notification_time);
        const ts = timeStringToTimestamp(shortTime(apt.time), mins);
        notifications.push({
          id: `apt-${apt.id}-${shortTime(apt.time)}`,
          title: `🐾 Cita de ${apt.pet_name}`,
          body: apt.custom_type_description ?? apt.type,
          timestamp: ts,
        });
      }
    }

    // ── Medicamentos de hoy ───────────────────────────────────────────────
    for (const med of medications) {
      if (!med.is_active || med.notification_time === "none") continue;
      if (med.start_date > todayStr) continue;
      if (med.duration_days > 0 && daysUntil(med.end_date) < 0) continue;
      if (med.frequency_hours && med.frequency_hours > 24) {
        const days = Math.round(-daysUntil(med.start_date));
        const interval = Math.round(med.frequency_hours / 24);
        if (days % interval !== 0) continue;
      }

      const mins = notificationMinutesFor(med.notification_time);
      for (const raw of med.scheduled_times) {
        const time = shortTime(raw);
        notifications.push({
          id: `med-${med.id}-${time}`,
          title: `💊 Medicamento de ${med.pet_name}`,
          body: `${med.name}${med.dosage ? ` — ${med.dosage}` : ""}`,
          timestamp: timeStringToTimestamp(time, mins),
        });
      }
    }

    // ── Ejercicios de hoy ─────────────────────────────────────────────────
    for (const ex of exercises) {
      if (!ex.is_active || ex.notification_time === "none") continue;
      if (ex.start_date > todayStr) continue;
      if (!ex.is_permanent && daysUntil(ex.end_date) < 0) continue;

      const label =
        ex.type === "otro" && ex.custom_type_description
          ? ex.custom_type_description
          : (exerciseTypeLabels[ex.type] ?? ex.type);
      const mins = notificationMinutesFor(ex.notification_time);
      for (const raw of ex.scheduled_times) {
        const time = shortTime(raw);
        notifications.push({
          id: `ex-${ex.id}-${time}`,
          title: `🏃 Ejercicio de ${ex.pet_name}`,
          body: `${label} — ${ex.duration_minutes} min`,
          timestamp: timeStringToTimestamp(time, mins),
        });
      }
    }

    // ── Cuidados post-op de hoy ───────────────────────────────────────────
    const todayDayOfWeek = new Date().getDay();
    for (const care of cares) {
      if (!care.is_active || care.notification_time === "none") continue;
      if (care.start_date > todayStr) continue;
      if (!care.is_permanent && daysUntil(care.end_date) < 0) continue;
      // Verificar si hoy es uno de los días configurados
      if (care.days_of_week && care.days_of_week.length > 0) {
        if (!care.days_of_week.map(Number).includes(todayDayOfWeek)) continue;
      }

      const label =
        care.type === "otro" && care.custom_type_description
          ? care.custom_type_description
          : careTypeLabels[care.type];
      const mins = notificationMinutesFor(care.notification_time);
      for (const raw of care.scheduled_times) {
        const time = shortTime(raw);
        notifications.push({
          id: `care-${care.id}-${time}`,
          title: `❤️ Cuidado de ${care.pet_name}`,
          body: `${label} — ${care.duration_minutes} min`,
          timestamp: timeStringToTimestamp(time, mins),
        });
      }
    }

    sendScheduleToSW(notifications);
  }, [appointments, medications, exercises, cares]);
}
