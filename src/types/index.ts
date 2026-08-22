// ============================================================
// Tipos del dominio. Coinciden 1:1 con los schemas de pewos-api.
// ============================================================

export type AppointmentType =
  | "control"
  | "examenes"
  | "operacion"
  | "fisioterapia"
  | "vacuna"
  | "desparasitacion"
  | "otro";

export type RecurrencePattern =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "none";

export type ExerciseType =
  | "caminata"
  | "cavaletti"
  | "balanceo"
  | "slalom"
  | "entrenamiento"
  | "otro";

export type CareType =
  | "limpieza_herida"
  | "frio"
  | "calor"
  | "infrarrojo"
  | "laser"
  | "otro";

export type ScheduleType = "hours" | "meals";

export type NotificationTime =
  | "none"
  | "15min"
  | "30min"
  | "1h"
  | "2h"
  | "1day";

export type TenantRole = "owner" | "member" | "viewer";

export type CompletionItemType =
  | "medication"
  | "exercise"
  | "appointment"
  | "care";

// ── Sesión y grupos ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Membership {
  id: string;
  name: string;
  timezone: string;
  role: TenantRole;
}

export interface Session {
  user: User;
  active_tenant: Membership | null;
  memberships: Membership[];
}

export interface TenantMember {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: TenantRole;
  joined_at: string;
}

export interface Invitation {
  id: string;
  code: string;
  role: TenantRole;
  max_uses: number;
  used_count: number;
  expires_at: string;
}

// ── Dominio ────────────────────────────────────────────────────────────────

export interface Pet {
  id: string;
  name: string;
  breed: string | null;
  birth_date: string | null;
  gender: "male" | "female" | null;
  neutered: boolean;
  photo_key: string | null;
  photo_url: string | null;
  /** Último pesaje. Llega como texto: la API lo serializa desde un Numeric. */
  weight_kg: string | null;
  weight_recorded_on: string | null;
  /** Con fecha, la mascota está archivada: conserva todo pero no recuerda nada. */
  archived_on: string | null;
  archived_reason: ArchiveReason | null;
}

export type ArchiveReason = "deceased" | "rehomed" | "other";

export interface PetWeight {
  id: string;
  pet_id: string;
  weight_kg: string;
  recorded_on: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  pet_name: string;
  type: AppointmentType;
  custom_type_description: string | null;
  date: string;
  time: string;
  notes: string | null;
  notification_time: NotificationTime;
  recurrence_pattern: RecurrencePattern;
  recurrence_end_date: string | null;
}

export interface Medication {
  id: string;
  pet_id: string;
  pet_name: string;
  name: string;
  dosage: string | null;
  schedule_type: ScheduleType;
  frequency_hours: number | null;
  start_time: string | null;
  start_date: string;
  duration_days: number;
  end_date: string | null;
  scheduled_times: string[];
  meal_time_ids: string[];
  notes: string | null;
  notification_time: NotificationTime;
  is_active: boolean;
}

export interface Exercise {
  id: string;
  pet_id: string;
  pet_name: string;
  type: ExerciseType;
  custom_type_description: string | null;
  duration_minutes: number;
  times_per_day: number;
  start_time: string;
  end_time: string;
  scheduled_times: string[];
  start_date: string;
  is_permanent: boolean;
  duration_weeks: number | null;
  end_date: string | null;
  notes: string | null;
  notification_time: NotificationTime;
  is_active: boolean;
}

export interface Care {
  id: string;
  pet_id: string;
  pet_name: string;
  type: CareType;
  custom_type_description: string | null;
  duration_minutes: number;
  times_per_day: number;
  start_time: string;
  end_time: string;
  scheduled_times: string[];
  start_date: string;
  is_permanent: boolean;
  duration_days: number | null;
  end_date: string | null;
  /** 0=Domingo … 6=Sábado. null = todos los días. */
  days_of_week: number[] | null;
  notes: string | null;
  notification_time: NotificationTime;
  is_active: boolean;
}

export interface MealTime {
  id: string;
  pet_id: string;
  name: string;
  time: string;
  order_index: number;
}

export interface Completion {
  id: string;
  item_type: CompletionItemType;
  item_id: string;
  scheduled_time: string | null;
  completed_date: string;
  completed_by_user_id: string | null;
  completed_by_name: string | null;
}

export interface Veterinarian {
  id: string;
  pet_id: string;
  pet_name: string;
  name: string;
  clinic_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}
