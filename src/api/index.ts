import type {
  Appointment,
  ArchiveReason,
  Care,
  Completion,
  CompletionItemType,
  Exercise,
  Invitation,
  MealTime,
  Medication,
  Pet,
  PetWeight,
  Session,
  TenantMember,
  TenantRole,
  Veterinarian,
} from "../types";
import { api } from "./client";

export { ApiError, setSessionLostHandler } from "./client";

export const auth = {
  me: () => api.get<Session>("/auth/me"),
  updateProfile: (payload: { first_name: string; last_name: string }) =>
    api.patch<Session>("/auth/me", payload),
  login: (email: string, password: string) =>
    api.post<Session>("/auth/login", { email, password }),
  register: (payload: {
    email: string;
    password: string;
    tenant_name?: string;
    first_name?: string;
    last_name?: string;
  }) =>
    api.post<Session>("/auth/register", {
      ...payload,
      // El grupo se crea con la zona del navegador; es la de la casa donde está la mascota.
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  logout: () => api.post<void>("/auth/logout"),
  switchTenant: (tenant_id: string) =>
    api.post<Session>("/auth/switch-tenant", { tenant_id }),
};

export const tenants = {
  update: (id: string, payload: { name?: string; timezone?: string }) =>
    api.patch<{ id: string; name: string; timezone: string }>(`/tenants/${id}`, payload),
  members: (id: string) => api.get<TenantMember[]>(`/tenants/${id}/members`),
  updateRole: (id: string, userId: string, role: TenantRole) =>
    api.patch<TenantMember>(`/tenants/${id}/members/${userId}`, { role }),
  removeMember: (id: string, userId: string) =>
    api.del<void>(`/tenants/${id}/members/${userId}`),
  leave: (id: string) => api.del<void>(`/tenants/${id}/members/me`),
  invitations: (id: string) => api.get<Invitation[]>(`/tenants/${id}/invitations`),
  createInvitation: (id: string, role: TenantRole) =>
    api.post<Invitation>(`/tenants/${id}/invitations`, { role }),
  revokeInvitation: (id: string, invitationId: string) =>
    api.del<void>(`/tenants/${id}/invitations/${invitationId}`),
  redeem: (code: string) => api.post<Session>(`/invitations/${code}/redeem`),
};

/** CRUD estándar: todos los recursos exponen la misma forma. */
function resource<T, TInput = Partial<T>>(path: string) {
  return {
    list: () => api.get<T[]>(path),
    create: (payload: TInput) => api.post<T>(path, payload),
    update: (id: string, payload: TInput) => api.patch<T>(`${path}/${id}`, payload),
    remove: (id: string) => api.del<void>(`${path}/${id}`),
  };
}

export const pets = {
  ...resource<Pet>("/pets"),
  photoUploadUrl: (id: string, contentType: string) =>
    api.post<{ upload_url: string; photo_key: string; expires_in: number }>(
      `/pets/${id}/photo-url`,
      { content_type: contentType },
    ),
  weights: (id: string) => api.get<PetWeight[]>(`/pets/${id}/weights`),
  recordWeight: (id: string, weight_kg: string, recorded_on: string) =>
    api.post<PetWeight>(`/pets/${id}/weights`, { weight_kg, recorded_on }),
  removeWeight: (id: string, weightId: string) =>
    api.del<void>(`/pets/${id}/weights/${weightId}`),
  archive: (id: string, reason: ArchiveReason, archived_on: string) =>
    api.post<Pet>(`/pets/${id}/archive`, { reason, archived_on }),
  unarchive: (id: string) => api.del<Pet>(`/pets/${id}/archive`),
};

export const appointments = resource<Appointment>("/appointments");
export const medications = resource<Medication>("/medications");
export const exercises = resource<Exercise>("/exercises");
export const cares = resource<Care>("/cares");
export const veterinarians = resource<Veterinarian>("/veterinarians");

/**
 * Los horarios cuelgan de la mascota, así que no encajan en `resource<T>`: cada llamada
 * necesita saber de quién son.
 */
export const mealTimes = (petId: string) => ({
  list: () => api.get<MealTime[]>(`/pets/${petId}/meal-times`),
  create: (payload: Partial<MealTime>) =>
    api.post<MealTime>(`/pets/${petId}/meal-times`, payload),
  update: (id: string, payload: Partial<MealTime>) =>
    api.patch<MealTime>(`/pets/${petId}/meal-times/${id}`, payload),
  remove: (id: string) => api.del<void>(`/pets/${petId}/meal-times/${id}`),
  reorder: (ids: string[]) =>
    api.put<MealTime[]>(`/pets/${petId}/meal-times/order`, { ids }),
});

export const completions = {
  /** Todas las de un día en una sola consulta. */
  forDate: (date: string) => api.get<Completion[]>("/completions", { date }),
  mark: (payload: {
    item_type: CompletionItemType;
    item_id: string;
    scheduled_time?: string | null;
    completed_date: string;
  }) => api.post<Completion>("/completions", payload),
  unmark: (payload: {
    item_type: CompletionItemType;
    item_id: string;
    scheduled_time?: string | null;
    completed_date: string;
  }) => api.del<void>("/completions", payload),
};
