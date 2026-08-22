import { CalendarDays, Home, PawPrint, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useMatches } from "react-router";

import type { RouteHandle, Tab } from "../navigation";
import { preloadOn } from "../routes";

const tabs: { id: Tab; label: string; icon: LucideIcon; path: string }[] = [
  { id: "home", label: "Hoy", icon: Home, path: "/" },
  // Agenda va antes que Mascotas: es la pestaña más usada después de Hoy.
  { id: "appointments", label: "Agenda", icon: CalendarDays, path: "/agenda" },
  { id: "pets", label: "Mascotas", icon: PawPrint, path: "/mascotas" },
  { id: "settings", label: "Ajustes", icon: Settings, path: "/ajustes" },
];

interface TabBarProps {
  className?: string;
}

/**
 * La pestaña marcada sale del `handle` de la ruta y no de comparar la URL: así
 * `/ajustes/medicamentos` marca Ajustes sin reglas de prefijo, y `/veterinarios` no marca
 * ninguna porque no declara pestaña.
 */
function TabBar({ className = "" }: TabBarProps) {
  const matches = useMatches();
  const currentTab = (matches.at(-1)?.handle as RouteHandle | undefined)?.tab;

  return (
    <nav
      aria-label="Navegación principal"
      className={`z-30 mx-3 mt-3 mb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-1 rounded-sheet bg-white p-1.5 shadow-float lg:mx-0 lg:mt-0 lg:mb-0 lg:w-24 lg:shrink-0 lg:flex-col lg:justify-start lg:gap-2 lg:rounded-none lg:p-3 lg:pt-8 lg:shadow-none lg:border-e lg:border-line ${className}`}
    >
      {tabs.map(({ id, label, icon: Icon, path }) => {
        const isActive = currentTab === id;
        return (
          <Link
            key={id}
            to={path}
            {...preloadOn(path)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-tile py-2 transition-colors lg:flex-none ${
              isActive
                ? "bg-brand-gradient text-white"
                : "text-subtle active:bg-canvas"
            }`}
          >
            <Icon size={20} aria-hidden />
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default TabBar;
