import { categoryOrder, categoryStyles } from "../../constants/categories";
import type { EventCategory } from "../../types/events";
import Chip from "../ui/Chip";

interface TypeFilterTabsProps {
  selected: EventCategory | null;
  onSelect: (category: EventCategory | null) => void;
  totalCount: number;
  countByCategory: Record<EventCategory, number>;
}

/**
 * Filtro por tipo de recordatorio. Excluyente: se elige uno o "Todo".
 *
 * Estos botones existían como "accesos rápidos" que navegaban a las pantallas de listado, que
 * no era lo que se buscaba. Esas pantallas siguen accesibles desde Ajustes.
 */
function TypeFilterTabs({
  selected,
  onSelect,
  totalCount,
  countByCategory,
}: TypeFilterTabsProps) {
  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto scrollbar-none px-5 pt-4 pb-3">
      <Chip
        active={selected === null}
        count={totalCount}
        onClick={() => onSelect(null)}
      >
        Todo
      </Chip>

      {categoryOrder.map((category) => {
        const count = countByCategory[category];
        if (count === 0) return null;
        const { labelShort, icon: Icon, fg } = categoryStyles[category];
        const active = selected === category;
        return (
          <Chip
            key={category}
            active={active}
            count={count}
            onClick={() => onSelect(active ? null : category)}
            leading={
              <Icon
                size={14}
                className={active ? "text-white" : fg}
                aria-hidden
              />
            }
          >
            {labelShort}
          </Chip>
        );
      })}
    </div>
  );
}

export default TypeFilterTabs;
