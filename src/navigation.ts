/**
 * Navegación de la app: pestañas, subpantallas, títulos y qué crea el botón "+".
 *
 * Vivía dentro de `AppLayout`, mezclado con el JSX y repartido entre cuatro constantes y dos
 * handlers. Los títulos eran de dos líneas, lo que obligaba a partir palabras con guion
 * ("Medica-"/"mento", "Veteri-"/"narios"); ahora son de una sola línea.
 */

export type Tab = "home" | "appointments" | "pets" | "settings";

export type SubScreen =
  | { kind: "none" }
  | { kind: "addEditPet"; petId?: string }
  | { kind: "addEditAppointment"; appointmentId?: string }
  | { kind: "addEditMedication"; medicationId?: string }
  | { kind: "addEditExercise"; exerciseId?: string }
  | { kind: "addEditCare"; careId?: string }
  | { kind: "mealTimes" }
  | { kind: "members" }
  | { kind: "medications" }
  | { kind: "exercises" }
  | { kind: "cares" }
  | { kind: "veterinarians" }
  | { kind: "addEditVeterinarian"; veterinarianId?: string };

export const tabTitles: Record<Tab, string> = {
  home: "Recordatorios de hoy",
  appointments: "Agenda",
  pets: "Mis mascotas",
  settings: "Ajustes",
};

const subScreenTitles: Record<Exclude<SubScreen["kind"], "none">, string> = {
  addEditPet: "Mascota",
  addEditAppointment: "Cita",
  addEditMedication: "Medicamento",
  addEditExercise: "Rutina de ejercicio",
  addEditCare: "Cuidado operatorio",
  mealTimes: "Horarios de comida",
  members: "Mi grupo",
  medications: "Medicamentos",
  exercises: "Rutinas de ejercicio",
  cares: "Cuidados operatorios",
  veterinarians: "Veterinarios",
  addEditVeterinarian: "Veterinario",
};

export function titleFor(tab: Tab, subScreen: SubScreen): string {
  return subScreen.kind === "none"
    ? tabTitles[tab]
    : subScreenTitles[subScreen.kind];
}

/**
 * Qué agrega el "+" en la pantalla actual.
 *
 * `"choose"` significa que no hay una sola cosa que agregar y hay que preguntar: pasa solo en
 * Hoy, donde conviven las cuatro categorías. `null` significa que la pantalla no crea nada.
 */
export function addActionFor(
  tab: Tab,
  subScreen: SubScreen,
): SubScreen | "choose" | null {
  switch (subScreen.kind) {
    case "medications":
      return { kind: "addEditMedication" };
    case "exercises":
      return { kind: "addEditExercise" };
    case "cares":
      return { kind: "addEditCare" };
    case "veterinarians":
      return { kind: "addEditVeterinarian" };
    case "none":
      break;
    default:
      // Formularios, horarios de comida y "mi grupo" no crean desde el header.
      return null;
  }

  switch (tab) {
    case "home":
      return "choose";
    case "pets":
      return { kind: "addEditPet" };
    case "appointments":
      return { kind: "addEditAppointment" };
    case "settings":
      return null;
  }
}
