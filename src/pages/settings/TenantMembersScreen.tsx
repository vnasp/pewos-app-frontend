import { Check, Copy, LogOut, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import * as apiClient from "../../api";
import { ApiError } from "../../api";
import { roleLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { useTenantMembers } from "../../hooks/queries";
import type { TenantRole } from "../../types";

const ASSIGNABLE_ROLES: TenantRole[] = ["owner", "member", "viewer"];

function TenantMembersScreen() {
  const { user, activeTenant, isOwner, redeemInvitation } = useAuth();
  const {
    members,
    invitations,
    isLoading,
    updateRole,
    removeMember,
    createInvitation,
    revokeInvitation,
  } = useTenantMembers();

  const [newRole, setNewRole] = useState<TenantRole>("member");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState(activeTenant?.name ?? "");
  const [savedName, setSavedName] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error");
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6 gap-6 lg:max-w-2xl lg:mx-auto lg:w-full">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Datos del grupo */}
      {activeTenant && (
        <section>
          <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">Grupo</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div>
              <label className="text-gray-700 font-semibold text-sm block mb-1">
                Nombre
              </label>
              <input
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setSavedName(false);
                }}
                disabled={!isOwner}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div className="text-gray-500 text-sm">
              Zona horaria:{" "}
              <span className="font-semibold text-gray-700">{activeTenant.timezone}</span>
              <p className="text-xs text-gray-400 mt-1">
                Es la de la casa donde están las mascotas: define a qué hora vencen los
                recordatorios para todo el grupo.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() =>
                  run(async () => {
                    await apiClient.tenants.update(activeTenant.id, { name: groupName });
                    setSavedName(true);
                  })
                }
                disabled={!groupName.trim() || groupName === activeTenant.name}
                className="bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-transform"
              >
                {savedName ? "Guardado" : "Guardar nombre"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Integrantes */}
      <section>
        <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">
          Integrantes ({members.length})
        </h3>
        <div className="flex flex-col gap-2">
          {members.map((member) => {
            const isMe = member.user_id === user?.id;
            return (
              <div
                key={member.user_id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-700 font-bold">
                  {(member.display_name ?? member.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">
                    {member.display_name ?? member.email}
                    {isMe && <span className="text-gray-400 font-normal"> (vos)</span>}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{member.email}</p>
                </div>

                {isOwner ? (
                  <select
                    value={member.role}
                    onChange={(e) =>
                      run(() =>
                        updateRole.mutateAsync({
                          userId: member.user_id,
                          role: e.target.value as TenantRole,
                        }),
                      )
                    }
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-500 text-xs shrink-0">
                    {roleLabels[member.role]}
                  </span>
                )}

                {isOwner && !isMe && (
                  <button
                    onClick={() =>
                      window.confirm(`¿Quitar a ${member.email} del grupo?`) &&
                      run(() => removeMember.mutateAsync(member.user_id))
                    }
                    className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Invitaciones */}
      {isOwner && (
        <section>
          <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">
            Códigos de invitación
          </h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as TenantRole)}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => run(() => createInvitation.mutateAsync(newRole))}
                className="bg-indigo-600 text-white font-semibold px-4 rounded-xl text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Plus size={16} />
                Crear
              </button>
            </div>

            {invitations.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">
                No hay códigos activos
              </p>
            ) : (
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2"
                >
                  <code className="flex-1 font-mono text-sm text-gray-900 truncate">
                    {invitation.code}
                  </code>
                  <span className="text-gray-400 text-xs shrink-0">
                    {roleLabels[invitation.role]} · {invitation.used_count}/
                    {invitation.max_uses}
                  </span>
                  <button
                    onClick={() => copyCode(invitation.code)}
                    className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    {copiedCode === invitation.code ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} className="text-indigo-600" />
                    )}
                  </button>
                  <button
                    onClick={() => run(() => revokeInvitation.mutateAsync(invitation.id))}
                    className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <X size={14} className="text-red-600" />
                  </button>
                </div>
              ))
            )}
            <p className="text-gray-400 text-xs">
              Compartí el código por donde quieras. Caduca a los 7 días y podés revocarlo
              en cualquier momento.
            </p>
          </div>
        </section>
      )}

      {/* Unirse a otro grupo */}
      <section>
        <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">
          Unirme a otro grupo
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Pegá el código acá"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() =>
              run(async () => {
                await redeemInvitation(joinCode.trim());
                setJoinCode("");
              })
            }
            disabled={!joinCode.trim()}
            className="bg-indigo-600 text-white font-semibold px-4 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-transform"
          >
            Unirme
          </button>
        </div>
      </section>

      {/* Salir del grupo */}
      {activeTenant && (
        <button
          onClick={() =>
            window.confirm(`¿Salir de "${activeTenant.name}"?`) &&
            run(async () => {
              await apiClient.tenants.leave(activeTenant.id);
              window.location.reload();
            })
          }
          className="flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 font-semibold py-3 rounded-xl text-sm active:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Salir de este grupo
        </button>
      )}
    </div>
  );
}

export default TenantMembersScreen;
