/**
 * Etiquetas y colores de presentación.
 *
 * Antes vivían dentro de los contexts de datos, que ya no existen; varias pantallas y el
 * scheduler de notificaciones locales ya los importaban desde ahí.
 */

import type {
  AppointmentType,
  ArchiveReason,
  CareType,
  ExerciseType,
  NotificationTime,
  RecurrencePattern,
  TenantRole,
} from "../types";

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  control: "Control",
  examenes: "Exámenes",
  operacion: "Operación",
  fisioterapia: "Fisioterapia",
  vacuna: "Vacuna",
  desparasitacion: "Desparasitación",
  otro: "Otro",
};

export const appointmentTypeColors: Record<AppointmentType, string> = {
  control: "bg-blue-100",
  examenes: "bg-amber-100",
  operacion: "bg-red-100",
  fisioterapia: "bg-green-100",
  vacuna: "bg-indigo-100",
  desparasitacion: "bg-purple-100",
  otro: "bg-gray-100",
};

export const recurrenceLabels: Record<RecurrencePattern, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  none: "Sin recurrencia",
};

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  caminata: "Caminata",
  cavaletti: "Cavaletti",
  balanceo: "Balanceo",
  slalom: "Slalom",
  entrenamiento: "Entrenamiento",
  otro: "Otro",
};

export const exerciseTypeColors: Record<ExerciseType, string> = {
  caminata: "bg-green-100",
  cavaletti: "bg-blue-100",
  balanceo: "bg-amber-100",
  slalom: "bg-purple-100",
  entrenamiento: "bg-indigo-100",
  otro: "bg-gray-100",
};

export const careTypeLabels: Record<CareType, string> = {
  limpieza_herida: "Limpiar herida",
  frio: "Aplicar frío",
  calor: "Aplicar calor",
  infrarrojo: "Luz infrarroja",
  laser: "Láser",
  otro: "Otro",
};

export const careTypeColors: Record<CareType, string> = {
  limpieza_herida: "bg-red-100",
  frio: "bg-blue-100",
  calor: "bg-orange-100",
  infrarrojo: "bg-amber-100",
  laser: "bg-purple-100",
  otro: "bg-gray-100",
};

export const notificationTimeLabels: Record<NotificationTime, string> = {
  none: "Sin recordatorio",
  "15min": "15 minutos antes",
  "30min": "30 minutos antes",
  "1h": "1 hora antes",
  "2h": "2 horas antes",
  "1day": "1 día antes",
};

export const roleLabels: Record<TenantRole, string> = {
  owner: "Administra",
  member: "Puede editar",
  viewer: "Solo lectura",
};

/** 0=Domingo … 6=Sábado, igual que `Date.getDay()` y que `cares.days_of_week`. */
export const weekDayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];


/** Cómo se nombra el archivado al elegirlo. */
export const archiveReasonLabels: Record<ArchiveReason, string> = {
  deceased: "Falleció",
  rehomed: "Se fue a otra casa",
  other: "Otro motivo",
};

/**
 * Cómo se cuenta después, ya en pasado y con fecha.
 *
 * Es la razón de ser del enum: "archivada el 12 de agosto" sirve para una mascota que se
 * mudó y suena mal para una que murió.
 */
export const archiveReasonSummary: Record<ArchiveReason, string> = {
  deceased: "Falleció el",
  rehomed: "Se fue a otra casa el",
  other: "Ya no está desde el",
};
