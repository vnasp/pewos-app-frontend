import { LogOut, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import * as apiClient from "../../api";
import { ApiError } from "../../api";
import InvitationsSheet from "../../components/settings/InvitationsSheet";
import Button from "../../components/ui/Button";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import ErrorText from "../../components/ui/ErrorText";
import { Field } from "../../components/ui/Field";
import { Input, Select } from "../../components/ui/Input";
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
      <ErrorText>{error}</ErrorText>

      {activeTenant && (
        <section>
          <h3 className="text-subtle text-xs font-bold uppercase tracking-wide mb-2">
            Datos del grupo
          </h3>
          <div className="bg-white rounded-2xl p-4 shadow-card border border-line flex flex-col gap-3">
            <Field label="Nombre">
              <Input
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setSaved(false);
                }}
                disabled={!isOwner}
              />
            </Field>

            <Field
              label="País"
              hint={
                currentTimeIn(country)
                  ? `Ahí son las ${currentTimeIn(country)}. Es la hora con la que vencen los recordatorios de todo el grupo.`
                  : "Define a qué hora vencen los recordatorios para todo el grupo."
              }
            >
              <Select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setSaved(false);
                }}
                disabled={!isOwner}
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
              </Select>
            </Field>

            {isOwner && (
              <Button
                block
                disabled={
                  !groupName.trim() ||
                  (groupName === activeTenant.name && country === activeTenant.timezone)
                }
                onClick={() =>
                  run(async () => {
                    await apiClient.tenants.update(activeTenant.id, {
                      name: groupName,
                      timezone: country,
                    });
                    setSaved(true);
                  })
                }
              >
                {saved ? "Guardado" : "Guardar cambios"}
              </Button>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-subtle text-xs font-bold uppercase tracking-wide">
            Integrantes ({members.length})
          </h3>
          {isOwner && (
            <Button size="sm" variant="secondary" onClick={() => setInviting(true)}>
              <UserPlus size={14} aria-hidden />
              Invitar
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {members.map((member) => {
            const isMe = member.user_id === user?.id;
            return (
              <div
                key={member.user_id}
                className="bg-white rounded-2xl p-4 shadow-card border border-line flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center shrink-0 text-brand font-extrabold">
                  {initial(member)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink font-bold text-sm truncate">
                    {fullName(member)}
                    {isMe && <span className="text-subtle font-medium"> (tú)</span>}
                  </p>
                  <p className="text-subtle text-xs truncate">{member.email}</p>
                </div>

                {isOwner ? (
                  <Select
                    value={member.role}
                    onChange={(e) =>
                      run(() =>
                        updateRole.mutateAsync({
                          userId: member.user_id,
                          role: e.target.value as TenantRole,
                        }),
                      )
                    }
                    aria-label={`Rol de ${member.email}`}
                    className="w-auto px-2 py-1.5 text-xs rounded-lg"
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <span className="text-subtle text-xs shrink-0">
                    {roleLabels[member.role]}
                  </span>
                )}

                {isOwner && !isMe && (
                  <button
                    type="button"
                    onClick={() => setMemberToRemove(member)}
                    aria-label={`Quitar a ${member.email}`}
                    className="w-8 h-8 bg-danger-soft rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  >
                    <Trash2 size={14} className="text-danger" aria-hidden />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {activeTenant && (
        <Button variant="danger" block onClick={() => setLeaving(true)}>
          <LogOut size={16} aria-hidden />
          Salir de este grupo
        </Button>
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
