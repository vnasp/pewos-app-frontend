import { useState } from "react";
import { useNavigate } from "react-router";

import { preloadOn } from "../../routes";
import { Clock, Dumbbell, HeartPulse, LogOut, Pill, Users } from "lucide-react";

import { roleLabels } from "../../constants/labels";
import ConfirmSheet from "../../components/ui/ConfirmSheet";
import { useAuth } from "../../context/AuthContext";

function SettingsScreen() {
  const navigate = useNavigate();
  const { user, signOut, activeTenant, memberships, switchTenant, role } = useAuth();

  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const items = [
    {
      label: "Medicamentos",
      icon: Pill,
      path: "/ajustes/medicamentos",
      color: "bg-pink-100",
      fg: "text-pink-600",
    },
    {
      label: "Rutinas de ejercicio",
      icon: Dumbbell,
      path: "/ajustes/ejercicios",
      color: "bg-green-100",
      fg: "text-green-600",
    },
    {
      label: "Cuidados post-operatorios",
      icon: HeartPulse,
      path: "/ajustes/cuidados",
      color: "bg-rose-100",
      fg: "text-rose-600",
    },
    {
      label: "Horarios de comida",
      icon: Clock,
      path: "/ajustes/horarios",
      color: "bg-amber-100",
      fg: "text-amber-600",
    },
    {
      label: "Integrantes del grupo",
      icon: Users,
      path: "/ajustes/grupo",
      color: "bg-indigo-100",
      fg: "text-indigo-600",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      <div className="px-5 pt-6 pb-4 lg:max-w-3xl lg:mx-auto lg:w-full">
        <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
            <span className="text-indigo-700 font-bold text-lg uppercase">
              {user?.email?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold truncate">{user?.email}</p>
            <p className="text-gray-500 text-xs">
              {activeTenant
                ? `${activeTenant.name} · ${roleLabels[role ?? "viewer"]}`
                : "Sin grupo activo"}
            </p>
          </div>
        </div>
      </div>

      {/* Selector de grupo: solo aparece si hay más de uno al que pertenecer. */}
      {memberships.length > 1 && (
        <div className="px-5 mb-5 lg:max-w-3xl lg:mx-auto lg:w-full">
          <p className="text-gray-500 text-xs font-semibold uppercase mb-3">Grupo activo</p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {memberships.map((membership) => (
              <button
                key={membership.id}
                onClick={() => switchTenant(membership.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <span className="text-gray-800 font-medium text-sm flex-1 truncate">
                  {membership.name}
                </span>
                <span className="text-gray-400 text-xs shrink-0">
                  {roleLabels[membership.role]}
                </span>
                {membership.id === activeTenant?.id && (
                  <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 mb-5 lg:max-w-3xl lg:mx-auto lg:w-full">
        <p className="text-gray-500 text-xs font-semibold uppercase mb-3">Gestión</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {items.map(({ label, icon: Icon, path, color, fg }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              {...preloadOn(path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <div
                className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className={fg} />
              </div>
              <span className="text-gray-800 font-medium text-sm flex-1">{label}</span>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 lg:max-w-3xl lg:mx-auto lg:w-full">
        <button
          onClick={() => setConfirmSignOut(true)}
          className="w-full bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
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
