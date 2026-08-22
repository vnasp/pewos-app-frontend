import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";

import * as apiClient from "../api";
import { ApiError, setSessionLostHandler } from "../api";
import type { Membership, Session, TenantRole, User } from "../types";

interface AuthContextValue {
  user: User | null;
  activeTenant: Membership | null;
  memberships: Membership[];
  role: TenantRole | null;
  /** Un viewer solo lee; la UI oculta las acciones que el backend rechazaría. */
  canWrite: boolean;
  isOwner: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, tenantName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  redeemInvitation: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = ["session"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: SESSION_KEY,
    queryFn: apiClient.auth.me,
    retry: false,
    // Un 401 acá es "no hay sesión", no un error a reintentar.
    throwOnError: false,
    staleTime: Infinity,
  });

  const isUnauthenticated =
    session.error instanceof ApiError && session.error.status === 401;

  useEffect(() => {
    setSessionLostHandler(() => queryClient.setQueryData(SESSION_KEY, null));
    return () => setSessionLostHandler(null);
  }, [queryClient]);

  /**
   * Cambiar de grupo vacía la caché entera. Las claves ya incluyen el tenant, así que
   * esto es defensa en profundidad contra datos del grupo anterior en pantalla.
   */
  const applySession = (next: Session | null, clearCache: boolean) => {
    queryClient.setQueryData(SESSION_KEY, next);
    if (clearCache) {
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" });
    }
  };

  const signIn = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.auth.login(email, password),
    onSuccess: (next) => applySession(next, true),
  });

  const signUp = useMutation({
    mutationFn: (payload: { email: string; password: string; tenant_name?: string }) =>
      apiClient.auth.register(payload),
    onSuccess: (next) => applySession(next, true),
  });

  const signOut = useMutation({
    mutationFn: apiClient.auth.logout,
    onSuccess: () => applySession(null, true),
  });

  const switchTenant = useMutation({
    mutationFn: apiClient.auth.switchTenant,
    onSuccess: (next) => applySession(next, true),
  });

  const redeemInvitation = useMutation({
    mutationFn: apiClient.tenants.redeem,
    onSuccess: (next) => applySession(next, true),
  });

  const data = session.data ?? null;
  const role = data?.active_tenant?.role ?? null;

  const value: AuthContextValue = {
    user: data?.user ?? null,
    activeTenant: data?.active_tenant ?? null,
    memberships: data?.memberships ?? [],
    role,
    canWrite: role === "owner" || role === "member",
    isOwner: role === "owner",
    loading: session.isLoading && !isUnauthenticated,
    signIn: async (email, password) => {
      await signIn.mutateAsync({ email, password });
    },
    signUp: async (email, password, tenantName) => {
      await signUp.mutateAsync({ email, password, tenant_name: tenantName });
    },
    signOut: async () => {
      await signOut.mutateAsync();
    },
    switchTenant: async (tenantId) => {
      await switchTenant.mutateAsync(tenantId);
    },
    /**
     * Canjear un código no cambia el grupo activo del lado de la API, así que la
     * pantalla no mostraría ningún cambio. Se salta al grupo recién unido, que es lo
     * que espera quien acaba de pegar un código.
     */
    redeemInvitation: async (code) => {
      const before = new Set((data?.memberships ?? []).map((m) => m.id));
      const next = await redeemInvitation.mutateAsync(code);
      const joined = next.memberships.find((m) => !before.has(m.id));
      if (joined) await switchTenant.mutateAsync(joined.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
