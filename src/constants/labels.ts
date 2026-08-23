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


export const careTypeLabels: Record<CareType, string> = {
  limpieza_herida: "Limpiar herida",
  frio: "Aplicar frío",
  calor: "Aplicar calor",
  infrarrojo: "Luz infrarroja",
  laser: "Láser",
  otro: "Otro",
};


export const notificationTimeLabels: Record<NotificationTime, string> = {
  none: "Sin recordatorio",
  "15min": "15 minutos antes",
  "30min": "30 minutos antes",
  "1h": "1 hora antes",
  "2h": "2 horas antes",
  "1day": "1 día antes",
};

/**
 * Las mismas opciones, en el orden en que se ofrecen.
 *
 * Los cuatro formularios repetían esta lista a mano, y con etiquetas distintas entre sí
 * —"Sin notificación" en uno, "Sin recordatorio" en otro— para las mismas opciones.
 */
export const notificationOptions = (
  ["none", "15min", "30min", "1h", "2h", "1day"] as const
).map((value) => ({ value, label: notificationTimeLabels[value] }));

export const roleLabels: Record<TenantRole, string> = {
  owner: "Administra",
  member: "Puede editar",
  viewer: "Solo lectura",
};

/** 0=Domingo … 6=Sábado, igual que `Date.getDay()` y que `cares.days_of_week`. */
export const weekDayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/**
 * La misma semana en una letra, para los selectores de días.
 *
 * Miércoles es X y no M: la inicial la comparte con martes, y en una fila de siete
 * botones dos "M" seguidas no se pueden distinguir.
 */
export const weekDayInitials = ["D", "L", "M", "X", "J", "V", "S"];


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
