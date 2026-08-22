import { useMemo } from "react";

import type { HomeEvent } from "../types/events";
import { today } from "../utils/date";
import { deriveTodayEvents } from "../utils/todayEvents";
import { useAppointments, useCares, useExercises, useMedications } from "./queries";

/**
 * Recordatorios que tocan hoy, ya ordenados por hora.
 *
 * Envoltorio delgado sobre `deriveTodayEvents`: aquí solo se leen las queries y el reloj,
 * para que toda la lógica de qué toca y qué no quede en una función pura y testeable.
 */
export function useTodayEvents(): { events: HomeEvent[]; isLoading: boolean } {
  const { items: appointments, isLoading: loadingAppointments } = useAppointments();
  const { items: medications, isLoading: loadingMedications } = useMedications();
  const { items: exercises, isLoading: loadingExercises } = useExercises();
  const { items: cares, isLoading: loadingCares } = useCares();

  const todayStr = today();

  const events = useMemo(
    () =>
      deriveTodayEvents({
        appointments,
        medications,
        exercises,
        cares,
        todayStr,
        dayOfWeek: new Date().getDay(),
      }),
    [appointments, medications, exercises, cares, todayStr],
  );

  return {
    events,
    isLoading:
      loadingAppointments ||
      loadingMedications ||
      loadingExercises ||
      loadingCares,
  };
}
