import { Check, Copy, Plus, X } from "lucide-react";
import { useState } from "react";

import { roleLabels } from "../../constants/labels";
import type { Invitation, TenantRole } from "../../types";
import Sheet from "../ui/Sheet";

const ASSIGNABLE_ROLES: TenantRole[] = ["owner", "member", "viewer"];

interface InvitationsSheetProps {
  open: boolean;
  onClose: () => void;
  invitations: Invitation[];
  onCreate: (role: TenantRole) => void;
  onRevoke: (invitationId: string) => void;
}

/**
 * Crear y revocar códigos de invitación.
 *
 * En una hoja y no como sección fija: invitar es algo que se hace un par de veces en la
 * vida del grupo, y ocupaba el bloque más alto de la pantalla estando ahí siempre.
 */
function InvitationsSheet({
  open,
  onClose,
  invitations,
  onCreate,
  onRevoke,
}: InvitationsSheetProps) {
  const [role, setRole] = useState<TenantRole>("member");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Invitar al grupo">
      <p className="text-sm text-muted font-medium -mt-1 mb-4">
        Genera un código y compártelo por donde quieras. Caduca a los 7 días y puedes
        revocarlo en cualquier momento.
      </p>

      <div className="flex gap-2 mb-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as TenantRole)}
          className="flex-1 border border-black/10 rounded-2xl px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
        >
          {ASSIGNABLE_ROLES.map((option) => (
            <option key={option} value={option}>
              {roleLabels[option]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onCreate(role)}
          className="bg-brand-gradient text-white font-bold px-4 rounded-full text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Plus size={16} aria-hidden />
          Crear
        </button>
      </div>

      {invitations.length === 0 ? (
        <p className="text-subtle text-sm text-center py-4">No hay códigos activos</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center gap-2 border border-black/10 rounded-2xl px-3 py-2"
            >
              <code className="flex-1 font-mono text-sm text-ink truncate">
                {invitation.code}
              </code>
              <span className="text-subtle text-xs shrink-0">
                {roleLabels[invitation.role]} · {invitation.used_count}/
                {invitation.max_uses}
              </span>
              <button
                type="button"
                onClick={() => copy(invitation.code)}
                aria-label="Copiar código"
                className="w-8 h-8 bg-brand-soft rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              >
                {copied === invitation.code ? (
                  <Check size={14} className="text-success" aria-hidden />
                ) : (
                  <Copy size={14} className="text-brand" aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={() => onRevoke(invitation.id)}
                aria-label="Revocar código"
                className="w-8 h-8 bg-danger-soft rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              >
                <X size={14} className="text-danger" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

export default InvitationsSheet;
