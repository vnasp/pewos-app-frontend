import { LogOut, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import * as apiClient from "../../api";
import { ApiError } from "../../api";
import InvitationsSheet from "../../components/settings/InvitationsSheet";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import Spinner from "../../components/ui/Spinner";
import {
  countries,
  countryForTimezone,
  currentTimeIn,
} from "../../constants/countries";
import { roleLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { useTenantMembers } from "../../hooks/queries";
import type { TenantRole } from "../../types";
import { fullName, initial } from "../../utils/name";

const ASSIGNABLE_ROLES: TenantRole[] = ["owner", "member", "viewer"];

const FIELD =
  "w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-500";

/**
 * Solo lo que es del grupo.
 *
 * El perfil y "unirme a otro grupo" se fueron a Mi perfil: te acompañan a cualquier
 * grupo, así que no eran de este. Las invitaciones pasaron a una hoja, que era el bloque
 * más alto y el que menos se usa.
 */
function TenantMembersScreen() {
  const { user, activeTenant, isOwner } = useAuth();
  const {
    members,
    invitations,
    isLoading,
    updateRole,
    removeMember,
    createInvitation,
    revokeInvitation,
  } = useTenantMembers();

  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState(activeTenant?.name ?? "");
  const [country, setCountry] = useState(activeTenant?.timezone ?? "");
  const [saved, setSaved] = useState(false);
  const [inviting, setInviting] = useState(false);
  // Las dos salidas del grupo: quitar a alguien y salirse uno mismo. Ninguna se deshace.
  const [memberToRemove, setMemberToRemove] = useState<{
    email: string;
    user_id: string;
  } | null>(null);
  const [leaving, setLeaving] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6 px-5 pt-6 gap-6 lg:max-w-2xl lg:mx-auto lg:w-full">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {activeTenant && (
        <section>
          <h3 className="text-gray-500 text-xs font-semibold uppercase mb-2">
            Datos del grupo
          </h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div>
              <label className="text-gray-700 font-semibold text-sm block mb-1">
                Nombre
              </label>
              <input
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setSaved(false);
                }}
                disabled={!isOwner}
                className={FIELD}
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold text-sm block mb-1">
                País
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setSaved(false);
                }}
                disabled={!isOwner}
                className={FIELD}
              >
                {/* Una zona guardada que no está en la lista —Magallanes, un país que
                    falte— tiene que poder seguir seleccionada, o abrir esta pantalla y
                    guardar la cambiaría sin que nadie lo pidiera. */}
                {!countryForTimezone(country) && (
                  <option value={country}>Otra zona ({country})</option>
                )}
                {countries.map((option) => (
                  <option key={option.timezone} value={option.timezone}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {currentTimeIn(country)
                  ? `Ahí son las ${currentTimeIn(country)}. Es la hora con la que vencen los recordatorios de todo el grupo.`
                  : "Define a qué hora vencen los recordatorios para todo el grupo."}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() =>
                  run(async () => {
                    await apiClient.tenants.update(activeTenant.id, {
                      name: groupName,
                      timezone: country,
                    });
                    setSaved(true);
                  })
                }
                disabled={
                  !groupName.trim() ||
                  (groupName === activeTenant.name && country === activeTenant.timezone)
                }
                className="bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-transform"
              >
                {saved ? "Guardado" : "Guardar cambios"}
              </button>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 text-xs font-semibold uppercase">
            Integrantes ({members.length})
          </h3>
          {isOwner && (
            <button
              onClick={() => setInviting(true)}
              className="flex items-center gap-1.5 bg-brand-soft text-brand font-bold px-3 py-1.5 rounded-full text-xs active:scale-95 transition-transform"
            >
              <UserPlus size={14} aria-hidden />
              Invitar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {members.map((member) => {
            const isMe = member.user_id === user?.id;
            return (
              <div
                key={member.user_id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-700 font-bold">
                  {initial(member)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">
                    {fullName(member)}
                    {isMe && <span className="text-gray-400 font-normal"> (tú)</span>}
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
                    onClick={() => setMemberToRemove(member)}
                    aria-label={`Quitar a ${member.email}`}
                    className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <Trash2 size={14} className="text-red-600" aria-hidden />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {activeTenant && (
        <button
          onClick={() => setLeaving(true)}
          className="flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 font-semibold py-3 rounded-xl text-sm active:bg-red-50 transition-colors"
        >
          <LogOut size={16} aria-hidden />
          Salir de este grupo
        </button>
      )}

      <InvitationsSheet
        open={inviting}
        onClose={() => setInviting(false)}
        invitations={invitations}
        onCreate={(role) => run(() => createInvitation.mutateAsync(role))}
        onRevoke={(id) => run(() => revokeInvitation.mutateAsync(id))}
      />

      <ConfirmSheet
        open={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() =>
          memberToRemove && run(() => removeMember.mutateAsync(memberToRemove.user_id))
        }
        title="¿Quitar del grupo?"
        description={`${memberToRemove?.email ?? "Esta persona"} dejará de ver las mascotas y sus recordatorios. Los datos del grupo no se pierden.`}
        confirmLabel="Quitar"
      />

      <ConfirmSheet
        open={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={() =>
          activeTenant &&
          run(async () => {
            await apiClient.tenants.leave(activeTenant.id);
            window.location.reload();
          })
        }
        title={`¿Salir de ${activeTenant?.name ?? "este grupo"}?`}
        description="Perderás el acceso a sus mascotas y a todo su historial. Alguien del grupo tendrá que volver a invitarte."
        confirmLabel="Salir del grupo"
      />
    </div>
  );
}

export default TenantMembersScreen;
