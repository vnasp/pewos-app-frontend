import { useMemo, useState } from "react";

import EventsList from "../components/home/EventsList";
import TypeFilterTabs from "../components/home/TypeFilterTabs";
import Spinner from "../components/ui/Spinner";
import { categoryOrder } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useCompletions } from "../hooks/queries";
import type { EventCategory, HomeEvent } from "../types/events";
import { today } from "../utils/date";

interface HomeScreenProps {
  /** Ya derivados y ordenados por hora, sin filtrar. */
  events: HomeEvent[];
  isLoading: boolean;
  /** El filtro de mascota vive en el header, que dibuja `AppLayout`. */
  selectedPetId: string | null;
}

export default function HomeScreen({
  events,
  isLoading,
  selectedPetId,
}: HomeScreenProps) {
  const { canWrite } = useAuth();
  const todayStr = useMemo(() => today(), []);
  const { isDone, mark, unmark } = useCompletions(todayStr);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(
    null,
  );

  // La mascota es la dimensión externa: los contadores por tipo se calculan sobre
  // los eventos ya filtrados por mascota, no al revés.
  const petEvents = useMemo(
    () =>
      selectedPetId
        ? events.filter((ev) => ev.data.pet_id === selectedPetId)
        : events,
    [events, selectedPetId],
  );

  const countByCategory = useMemo(() => {
    const counts = Object.fromEntries(
      categoryOrder.map((c) => [c, 0]),
    ) as Record<EventCategory, number>;
    for (const ev of petEvents) counts[ev.type] += 1;
    return counts;
  }, [petEvents]);

  const visibleEvents = useMemo(
    () =>
      selectedCategory
        ? petEvents.filter((ev) => ev.type === selectedCategory)
        : petEvents,
    [petEvents, selectedCategory],
  );

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <TypeFilterTabs
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        totalCount={petEvents.length}
        countByCategory={countByCategory}
      />
      <EventsList
        events={visibleEvents}
        completionFor={completionFor}
        showPetName={selectedPetId === null}
        canWrite={canWrite}
        onToggle={handleToggle}
      />
    </div>
  );
}
