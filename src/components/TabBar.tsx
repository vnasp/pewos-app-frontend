import { CalendarDays, Home, PawPrint, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Tab } from "../navigation";

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Hoy", icon: Home },
  // Agenda va antes que Mascotas: es la pestaña más usada después de Hoy.
  { id: "appointments", label: "Agenda", icon: CalendarDays },
  { id: "pets", label: "Mascotas", icon: PawPrint },
  { id: "settings", label: "Ajustes", icon: Settings },
];

interface TabBarProps {
  currentTab: Tab;
  onNavigate: (tab: Tab) => void;
  className?: string;
}

export default function TabBar({
  currentTab,
  onNavigate,
  className = "",
}: TabBarProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className={`z-30 mx-3 mb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-1 rounded-sheet bg-white p-1.5 shadow-float lg:mx-0 lg:mb-0 lg:w-24 lg:shrink-0 lg:flex-col lg:justify-start lg:gap-2 lg:rounded-none lg:p-3 lg:pt-8 lg:shadow-none lg:border-e lg:border-line ${className}`}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = currentTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-tile py-2.5 transition-colors lg:flex-none ${
              isActive
                ? "bg-brand-gradient text-white"
                : "text-subtle active:bg-canvas"
            }`}
          >
            <Icon size={20} aria-hidden />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
