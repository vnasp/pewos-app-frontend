import type {
  Appointment,
  Care,
  Completion,
  CompletionItemType,
  Exercise,
  Invitation,
  MealTime,
  Medication,
  Pet,
  Session,
  TenantMember,
  TenantRole,
  Veterinarian,
} from "../types";
import { api } from "./client";

export { ApiError, setSessionLostHandler } from "./client";

export const auth = {
  me: () => api.get<Session>("/auth/me"),
  login: (email: string, password: string) =>
    api.post<Session>("/auth/login", { email, password }),
  register: (payload: {
    email: string;
    password: string;
    tenant_name?: string;
    display_name?: string;
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
};

export const appointments = resource<Appointment>("/appointments");
export const medications = resource<Medication>("/medications");
export const exercises = resource<Exercise>("/exercises");
export const cares = resource<Care>("/cares");
export const veterinarians = resource<Veterinarian>("/veterinarians");

export const mealTimes = {
  ...resource<MealTime>("/meal-times"),
  reorder: (ids: string[]) => api.put<MealTime[]>("/meal-times/order", { ids }),
};

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
