import { useMemo, useState } from "react";
import QuickAccess from "../components/home/QuickAccess";
import PetFilterTabs from "../components/home/PetFilterTabs";
import EventsList from "../components/home/EventsList";
import type { HomeEvent } from "../components/home/types";
import {
  useAppointments,
  useCares,
  useCompletions,
  useExercises,
  useMedications,
  usePets,
} from "../hooks/queries";
import { useAuth } from "../context/AuthContext";
import { daysUntil, shortTime, today } from "../utils/date";

interface HomeScreenProps {
  onNavigateToMedications: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToExercises: () => void;
  onNavigateToCares: () => void;
}

export default function HomeScreen({
  onNavigateToMedications,
  onNavigateToCalendar,
  onNavigateToExercises,
  onNavigateToCares,
}: HomeScreenProps) {
  const { canWrite } = useAuth();
  const { items: appointments } = useAppointments();
  const { items: medications } = useMedications();
  const { items: exercises } = useExercises();
  const { items: cares } = useCares();
  const { items: pets } = usePets();

  const todayStr = useMemo(() => today(), []);
  const { isDone, mark, unmark } = useCompletions(todayStr);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === todayStr)
        .map((a) => ({
          type: "appointment" as const,
          id: a.id,
          petName: a.pet_name,
          time: shortTime(a.time),
          data: a,
        })),
    [appointments, todayStr],
  );

  const todayMedications = useMemo(
    () =>
      medications
        .filter((m) => {
          if (!m.is_active) return false;
          if (m.start_date > todayStr) return false;
          if (m.duration_days !== 0 && daysUntil(m.end_date) < 0) return false;
          // Intervalos > 24h (p.ej. cada 48h) solo tocan algunos días.
          if (m.frequency_hours && m.frequency_hours > 24) {
            const elapsed = Math.round(-daysUntil(m.start_date));
            const intervalDays = Math.round(m.frequency_hours / 24);
            if (elapsed % intervalDays !== 0) return false;
          }
          return true;
        })
        .flatMap((m) =>
          m.scheduled_times.map((raw) => {
            const time = shortTime(raw);
            return {
              type: "medication" as const,
              id: `${m.id}-${time}`,
              petName: m.pet_name,
              time,
              medicationId: m.id,
              scheduledTime: time,
              data: m,
            };
          }),
        ),
    [medications, todayStr],
  );

  const todayExercises = useMemo(
    () =>
      exercises
        .filter((e) => {
          if (!e.is_active) return false;
          if (e.start_date > todayStr) return false;
          if (e.is_permanent) return true;
          return daysUntil(e.end_date) >= 0;
        })
        .flatMap((e) =>
          e.scheduled_times.map((raw) => {
            const time = shortTime(raw);
            return {
              type: "exercise" as const,
              id: `${e.id}-${time}`,
              petName: e.pet_name,
              time,
              exerciseId: e.id,
              scheduledTime: time,
              data: e,
            };
          }),
        ),
    [exercises, todayStr],
  );

  const todayCares = useMemo(() => {
    const dayOfWeek = new Date().getDay(); // 0=domingo … 6=sábado
    return cares
      .filter((c) => {
        if (!c.is_active) return false;
        if (c.start_date > todayStr) return false;
        if (c.days_of_week?.length && !c.days_of_week.includes(dayOfWeek))
          return false;
        if (c.is_permanent) return true;
        return daysUntil(c.end_date) >= 0;
      })
      .flatMap((c) =>
        c.scheduled_times.map((raw) => {
          const time = shortTime(raw);
          return {
            type: "care" as const,
            id: `${c.id}-${time}`,
            petName: c.pet_name,
            time,
            careId: c.id,
            scheduledTime: time,
            data: c,
          };
        }),
      );
  }, [cares, todayStr]);

  const allEvents = useMemo(
    () =>
      [
        ...todayAppointments,
        ...todayMedications,
        ...todayExercises,
        ...todayCares,
      ].sort((a, b) => a.time.localeCompare(b.time)),
    [todayAppointments, todayMedications, todayExercises, todayCares],
  );

  const filteredEvents = useMemo(
    () =>
      selectedPetId
        ? allEvents.filter((ev) => ev.data.pet_id === selectedPetId)
        : allEvents,
    [allEvents, selectedPetId],
  );

  const countByPet = useMemo(() => {
    const map: Record<string, number> = {};
    allEvents.forEach((ev) => {
      map[ev.data.pet_id] = (map[ev.data.pet_id] ?? 0) + 1;
    });
    return map;
  }, [allEvents]);

  const completionFor = (ev: HomeEvent) =>
    ev.type === "appointment"
      ? isDone("appointment", ev.data.id, null)
      : isDone(
          ev.type,
          ev.type === "medication"
            ? ev.medicationId
            : ev.type === "exercise"
              ? ev.exerciseId
              : ev.careId,
          ev.scheduledTime,
        );

  const handleToggle = async (ev: HomeEvent) => {
    if (isProcessing || !canWrite) return;
    setIsProcessing(true);
    try {
      const payload = {
        item_type: ev.type,
        item_id:
          ev.type === "appointment"
            ? ev.data.id
            : ev.type === "medication"
              ? ev.medicationId
              : ev.type === "exercise"
                ? ev.exerciseId
                : ev.careId,
        scheduled_time: ev.type === "appointment" ? null : ev.scheduledTime,
      };
      const mutation = completionFor(ev) ? unmark : mark;
      await mutation.mutateAsync(payload);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4 lg:pb-8">
      <QuickAccess
        onNavigateToMedications={onNavigateToMedications}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToExercises={onNavigateToExercises}
        onNavigateToCares={onNavigateToCares}
      />
      <PetFilterTabs
        pets={pets}
        selectedPetId={selectedPetId}
        onSelect={setSelectedPetId}
        totalCount={allEvents.length}
        countByPet={countByPet}
      />
      <EventsList
        events={filteredEvents}
        completionFor={completionFor}
        selectedPetId={selectedPetId}
        pets={pets}
        canWrite={canWrite}
        onToggle={handleToggle}
      />
    </div>
  );
}
