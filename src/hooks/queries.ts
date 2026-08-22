import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import * as apiClient from "../api";
import { useAuth } from "../context/AuthContext";
import { shortTime } from "../utils/date";
import type {
  Appointment,
  ArchiveReason,
  Care,
  Completion,
  CompletionItemType,
  Exercise,
  MealTime,
  Medication,
  Pet,
  Veterinarian,
} from "../types";

/**
 * Toda clave de consulta lleva el grupo activo.
 *
 * Es el punto fácil de equivocarse en esta migración: sin el tenant en la clave, cambiar
 * de grupo mostraría los datos cacheados del anterior.
 */
function useScopedKey(name: string) {
  const { activeTenant } = useAuth();
  return [name, activeTenant?.id ?? "none"] as const;
}

interface CrudApi<T> {
  list: () => Promise<T[]>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface CrudHook<T> {
  items: T[];
  isLoading: boolean;
  error: Error | null;
  create: UseMutationResult<T, Error, Partial<T>>;
  update: UseMutationResult<T, Error, { id: string; data: Partial<T> }>;
  remove: UseMutationResult<void, Error, string>;
  byId: (id: string | undefined) => T | undefined;
}

function useCrud<T extends { id: string }>(name: string, resource: CrudApi<T>): CrudHook<T> {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuth();
  const key = useScopedKey(name);

  const query = useQuery({
    queryKey: key,
    queryFn: resource.list,
    enabled: Boolean(activeTenant),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create: useMutation({ mutationFn: resource.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
        resource.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: resource.remove, onSuccess: invalidate }),
    byId: (id) => (id ? query.data?.find((item) => item.id === id) : undefined),
  };
}

/**
 * Mascotas del grupo.
 *
 * `items` las trae todas, porque las archivadas siguen apareciendo en su sección y hay
 * que poder resolver su nombre en el historial. `active` es la lista que quiere casi
 * todo lo demás: selectores, chips y el guard de "primero agrega una mascota".
 */
export function usePets() {
  const queryClient = useQueryClient();
  const key = useScopedKey("pets");
  const crud = useCrud<Pet>("pets", apiClient.pets);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  return {
    ...crud,
    active: crud.items.filter((pet) => pet.archived_on === null),
    archived: crud.items.filter((pet) => pet.archived_on !== null),
    archive: useMutation({
      mutationFn: ({ id, reason, on }: { id: string; reason: ArchiveReason; on: string }) =>
        apiClient.pets.archive(id, reason, on),
      // Invalida también lo que se apagó al archivar: sus pautas quedaron inactivas.
      onSuccess: () => {
        invalidate();
        for (const name of ["medications", "exercises", "cares"]) {
          queryClient.invalidateQueries({ queryKey: [name, key[1]] });
        }
      },
    }),
    unarchive: useMutation({
      mutationFn: (id: string) => apiClient.pets.unarchive(id),
      onSuccess: invalidate,
    }),
  };
}

/**
 * Registra un pesaje.
 *
 * Vive aparte de `usePets` porque no es un CRUD de mascotas: escribe en otra tabla, pero
 * invalida la misma clave, ya que el último peso viaja dentro de cada mascota.
 */
export function useRecordWeight() {
  const queryClient = useQueryClient();
  const key = useScopedKey("pets");

  return useMutation({
    mutationFn: ({ petId, weight, on }: { petId: string; weight: string; on: string }) =>
      apiClient.pets.recordWeight(petId, weight, on),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/**
 * Mascotas que puede elegir un formulario.
 *
 * Las activas, más la que ya estaba elegida aunque esté archivada: editando el
 * medicamento de una mascota que falleció, su nombre tiene que seguir en el selector o
 * el formulario aparecería sin mascota y guardarlo se la cambiaría a otra.
 */
export function usePetOptions(selectedId?: string | null): Pet[] {
  const { active, byId } = usePets();
  const selected = byId(selectedId ?? undefined);

  return selected && selected.archived_on !== null ? [...active, selected] : active;
}

export const useAppointments = () =>
  useCrud<Appointment>("appointments", apiClient.appointments);
export const useMedications = () =>
  useCrud<Medication>("medications", apiClient.medications);
export const useExercises = () => useCrud<Exercise>("exercises", apiClient.exercises);
export const useCares = () => useCrud<Care>("cares", apiClient.cares);
export const useVeterinarians = () =>
  useCrud<Veterinarian>("veterinarians", apiClient.veterinarians);

/**
 * Horarios de comida de una mascota.
 *
 * Fuera de `useCrud` porque su clave lleva la mascota además del grupo, y porque el
 * cliente es una factoría: cada petición necesita saber de quién son los horarios.
 */
export function useMealTimes(petId: string | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuth();
  const key = [...useScopedKey("meal-times"), petId ?? "none"] as const;
  const api = apiClient.mealTimes(petId ?? "");

  const query = useQuery({
    queryKey: key,
    queryFn: api.list,
    enabled: Boolean(activeTenant) && Boolean(petId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    create: useMutation({ mutationFn: api.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<MealTime> }) =>
        api.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: api.remove, onSuccess: invalidate }),
    reorder: useMutation({
      mutationFn: api.reorder,
      onSuccess: (ordered) => queryClient.setQueryData(key, ordered),
    }),
  };
}

/** Completions del día en una sola consulta, en vez de una por evento. */
export function useCompletions(date: string) {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuth();
  const key = [...useScopedKey("completions"), date] as const;

  const query = useQuery({
    queryKey: key,
    queryFn: () => apiClient.completions.forDate(date),
    enabled: Boolean(activeTenant),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  // La API devuelve TIME como "HH:MM:SS" y la UI trabaja con "HH:MM": se normalizan
  // ambos lados de la clave para que el lookup no falle por los segundos.
  const slotKey = (
    itemType: CompletionItemType,
    itemId: string,
    scheduledTime?: string | null,
  ) => `${itemType}:${itemId}:${shortTime(scheduledTime)}`;

  const done = new Map(
    (query.data ?? []).map((c) => [
      slotKey(c.item_type, c.item_id, c.scheduled_time),
      c,
    ]),
  );

  return {
    completions: query.data ?? [],
    isLoading: query.isLoading,
    isDone: (
      itemType: CompletionItemType,
      itemId: string,
      scheduledTime?: string | null,
    ): Completion | undefined => done.get(slotKey(itemType, itemId, scheduledTime)),
    mark: useMutation({
      mutationFn: (payload: {
        item_type: CompletionItemType;
        item_id: string;
        scheduled_time?: string | null;
      }) => apiClient.completions.mark({ ...payload, completed_date: date }),
      onSuccess: invalidate,
    }),
    unmark: useMutation({
      mutationFn: (payload: {
        item_type: CompletionItemType;
        item_id: string;
        scheduled_time?: string | null;
      }) => apiClient.completions.unmark({ ...payload, completed_date: date }),
      onSuccess: invalidate,
    }),
  };
}

export function useTenantMembers() {
  const { activeTenant } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = activeTenant?.id;
  const membersKey = ["tenant-members", tenantId ?? "none"] as const;
  const invitesKey = ["tenant-invitations", tenantId ?? "none"] as const;

  const members = useQuery({
    queryKey: membersKey,
    queryFn: () => apiClient.tenants.members(tenantId!),
    enabled: Boolean(tenantId),
  });

  const invitations = useQuery({
    queryKey: invitesKey,
    queryFn: () => apiClient.tenants.invitations(tenantId!),
    // Solo un owner puede listarlas; para el resto devolvería 403.
    enabled: Boolean(tenantId) && activeTenant?.role === "owner",
  });

  const refreshMembers = () => queryClient.invalidateQueries({ queryKey: membersKey });
  const refreshInvites = () => queryClient.invalidateQueries({ queryKey: invitesKey });

  return {
    members: members.data ?? [],
    invitations: invitations.data ?? [],
    isLoading: members.isLoading,
    updateRole: useMutation({
      mutationFn: ({ userId, role }: { userId: string; role: Parameters<typeof apiClient.tenants.updateRole>[2] }) =>
        apiClient.tenants.updateRole(tenantId!, userId, role),
      onSuccess: refreshMembers,
    }),
    removeMember: useMutation({
      mutationFn: (userId: string) => apiClient.tenants.removeMember(tenantId!, userId),
      onSuccess: refreshMembers,
    }),
    createInvitation: useMutation({
      mutationFn: (role: Parameters<typeof apiClient.tenants.createInvitation>[1]) =>
        apiClient.tenants.createInvitation(tenantId!, role),
      onSuccess: refreshInvites,
    }),
    revokeInvitation: useMutation({
      mutationFn: (invitationId: string) =>
        apiClient.tenants.revokeInvitation(tenantId!, invitationId),
      onSuccess: refreshInvites,
    }),
  };
}
