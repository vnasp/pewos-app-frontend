import { useState } from "react";
import { useNavigate } from "react-router";

import { LogOut, Users } from "lucide-react";

import { preloadOn } from "../../routes";

import Button from "../../components/ui/Button";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import { categoryStyles } from "../../constants/categories";
import { roleLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { fullName, initial } from "../../utils/name";

function SettingsScreen() {
  const navigate = useNavigate();
  const { user, signOut, activeTenant, memberships, switchTenant, role } = useAuth();

  const [confirmSignOut, setConfirmSignOut] = useState(false);

  /**
   * Icono y color salen de `categoryStyles`, que es de donde los saca el resto de la app.
   *
   * Escritos a mano acá estaban cruzados: medicamentos en rosa suelto, ejercicios en el
   * verde de "hecho" y cuidados en el rosa de los medicamentos. Quien viniera de la
   * pantalla de Hoy veía otro color para lo mismo.
   */
  const items = [
    { ...categoryStyles.medication, label: "Medicamentos", path: "/ajustes/medicamentos" },
    { ...categoryStyles.exercise, label: "Rutinas de ejercicio", path: "/ajustes/ejercicios" },
    { ...categoryStyles.care, label: "Cuidados post-operatorios", path: "/ajustes/cuidados" },
    // Neutro y no de marca: el grupo no es una categoría de recordatorio, y con color
    // parecía una cuarta de la lista.
    {
      label: "Integrantes del grupo",
      icon: Users,
      path: "/ajustes/grupo",
      soft: "bg-canvas",
      fg: "text-subtle",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      <div className="px-5 pt-6 pb-4 lg:max-w-3xl lg:mx-auto lg:w-full">
        {/* Era decorativa: mostraba el correo y no llevaba a ninguna parte. Ahora es la
            entrada al perfil, que es lo que uno busca al tocarla. */}
        <button
          onClick={() => navigate("/ajustes/perfil")}
          {...preloadOn("/ajustes/perfil")}
          className="w-full bg-brand-soft rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
        >
          <div className="w-12 h-12 bg-brand-gradient rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-lg uppercase">
              {user ? initial(user) : ""}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink font-bold truncate">
              {user ? fullName(user) : ""}
            </p>
            <p className="text-subtle text-xs">
              {activeTenant
                ? `${activeTenant.name} · ${roleLabels[role ?? "viewer"]}`
                : "Sin grupo activo"}
            </p>
          </div>
          <span className="text-subtle text-lg shrink-0">›</span>
        </button>
      </div>

      {/* Selector de grupo: solo aparece si hay más de uno al que pertenecer. */}
      {memberships.length > 1 && (
        <div className="px-5 mb-5 lg:max-w-3xl lg:mx-auto lg:w-full">
          <p className="text-subtle text-xs font-bold uppercase tracking-wide mb-3">
            Grupo activo
          </p>
          <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden divide-y divide-line">
            {memberships.map((membership) => (
              <button
                key={membership.id}
                onClick={() => switchTenant(membership.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-canvas active:bg-canvas transition-colors text-left"
              >
                <span className="text-ink font-medium text-sm flex-1 truncate">
                  {membership.name}
                </span>
                <span className="text-subtle text-xs shrink-0">
                  {roleLabels[membership.role]}
                </span>
                {membership.id === activeTenant?.id && (
                  <span className="w-2 h-2 bg-brand rounded-full shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 mb-5 lg:max-w-3xl lg:mx-auto lg:w-full">
        <p className="text-subtle text-xs font-bold uppercase tracking-wide mb-3">
          Gestión
        </p>
        <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden divide-y divide-line">
          {items.map(({ label, icon: Icon, path, soft, fg }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              {...preloadOn(path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-canvas active:bg-canvas transition-colors text-left"
            >
              <div
                className={`w-9 h-9 ${soft} rounded-xl flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className={fg} aria-hidden />
              </div>
              <span className="text-ink font-medium text-sm flex-1">{label}</span>
              <span className="text-subtle text-lg">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 lg:max-w-3xl lg:mx-auto lg:w-full">
        <Button
          variant="danger"
          block
          onClick={() => setConfirmSignOut(true)}
          leading={<LogOut size={18} aria-hidden />}
        >
          Cerrar sesión
        </Button>
      </div>

      <ConfirmSheet
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={signOut}
        title="¿Cerrar sesión?"
        description="Tendrás que volver a entrar con tu correo y contraseña. Los datos del grupo no se pierden."
        confirmLabel="Cerrar sesión"
      />
    </div>
  );
}

export default SettingsScreen;
