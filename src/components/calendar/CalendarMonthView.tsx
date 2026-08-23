import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "../../types";
import { parseLocalDate } from "../../utils/date";

interface CalendarMonthViewProps {
  appointments: Appointment[];
  selectedDate: Date | null;
  onDaySelect: (date: Date) => void;
}

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function CalendarMonthView({
  appointments,
  selectedDate,
  onDaySelect,
}: CalendarMonthViewProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthLabel = cursor.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  // Primer día de la semana (lunes = 0)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Agrupar citas por día (solo las del mes actual para lookup rápido)
  const byDay = useMemo(() => {
    const map: Record<number, Appointment[]> = {};
    appointments.forEach((a) => {
      const d = parseLocalDate(a.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [appointments, year, month]);

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl shadow-card mx-5 p-4">
      {/* Header mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-soft active:scale-90 transition-transform"
        >
          <ChevronLeft size={16} className="text-brand" />
        </button>
        <span className="font-bold text-ink capitalize text-sm">
          {monthLabel}
        </span>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-soft active:scale-90 transition-transform"
        >
          <ChevronRight size={16} className="text-brand" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-center text-xs font-semibold text-subtle py-1"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const cellDate = new Date(year, month, day);
          const isToday = sameDay(cellDate, today);
          const isSelected = selectedDate
            ? sameDay(cellDate, selectedDate)
            : false;
          const dayApts = byDay[day] ?? [];
          const isPast = cellDate < today;

          return (
            <button
              key={day}
              onClick={() => onDaySelect(cellDate)}
              className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
                isSelected
                  ? "bg-brand"
                  : isToday
                    ? "bg-brand-soft"
                    : "hover:bg-canvas"
              }`}
            >
              <span
                className={`text-sm font-semibold leading-6 ${
                  isSelected
                    ? "text-white"
                    : isToday
                      ? "text-brand"
                      : isPast
                        ? "text-subtle"
                        : "text-ink"
                }`}
              >
                {day}
              </span>
              {/* Dots de citas (max 3) */}
              <div className="flex gap-0.5 h-1.5 items-center mt-0.5">
                {/* Todos del mismo color: el punto dice "acá hay una cita", y siete
                    tonos según el subtipo no se distinguen a un píxel de tamaño. */}
                {dayApts.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : "bg-appointment"}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarMonthView;
