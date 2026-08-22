import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router";

import AppLayout from "./components/AppLayout";
import type { RouteHandle } from "./navigation";
// Hoy es la ruta índice y la más visitada: va en el bundle principal para que entrar a
// la app no cueste un chunk extra. El resto se carga cuando se pisa.
import HomeScreen from "./pages/home/HomeScreen";

/**
 * Los `import()` viven en un mapa y no sueltos dentro de `lazy` porque hacen doble
 * servicio: definen dónde corta cada chunk y son lo que `preloadRoute` invoca para
 * tenerlo en memoria antes de que haga falta. Llamarlos dos veces no cuesta nada, el
 * registro de módulos deduplica.
 */
const load = {
  calendar: () => import("./pages/agenda/CalendarListScreen"),
  appointmentForm: () => import("./pages/agenda/AddEditAppointmentScreen"),
  petsList: () => import("./pages/pets/PetsListScreen"),
  petForm: () => import("./pages/pets/AddEditPetScreen"),
  settings: () => import("./pages/settings/SettingsScreen"),
  mealTimes: () => import("./pages/settings/MealTimesSettingsScreen"),
  members: () => import("./pages/settings/TenantMembersScreen"),
  medsList: () => import("./pages/meds/MedicationsListScreen"),
  medForm: () => import("./pages/meds/AddEditMedicationScreen"),
  exercisesList: () => import("./pages/exercises/ExercisesListScreen"),
  exerciseForm: () => import("./pages/exercises/AddEditExerciseScreen"),
  caresList: () => import("./pages/cares/CaresListScreen"),
  careForm: () => import("./pages/cares/AddEditCareScreen"),
  vetsList: () => import("./pages/vets/VeterinariansListScreen"),
  vetForm: () => import("./pages/vets/AddEditVeterinarianScreen"),
};

const CalendarListScreen = lazy(load.calendar);
const AddEditAppointmentScreen = lazy(load.appointmentForm);
const PetsListScreen = lazy(load.petsList);
const AddEditPetScreen = lazy(load.petForm);
const SettingsScreen = lazy(load.settings);
const MealTimesSettingsScreen = lazy(load.mealTimes);
const TenantMembersScreen = lazy(load.members);
const MedicationsListScreen = lazy(load.medsList);
const AddEditMedicationScreen = lazy(load.medForm);
const ExercisesListScreen = lazy(load.exercisesList);
const AddEditExerciseScreen = lazy(load.exerciseForm);
const CaresListScreen = lazy(load.caresList);
const AddEditCareScreen = lazy(load.careForm);
const VeterinariansListScreen = lazy(load.vetsList);
const AddEditVeterinarianScreen = lazy(load.vetForm);

/**
 * Ruta → chunk que hay que tener cargado para pintarla sin esperar a la red.
 *
 * Solo están las rutas que alguien precarga: las pestañas y los destinos del "+". El
 * formulario de edición comparte componente con el de alta, así que calentar
 * `/x/nuevo` deja listo también `/x/:id`.
 */
const preloaders: Record<string, () => Promise<unknown>> = {
  "/agenda": load.calendar,
  "/agenda/nueva": load.appointmentForm,
  "/mascotas": load.petsList,
  "/mascotas/nueva": load.petForm,
  "/ajustes": load.settings,
  "/ajustes/horarios": load.mealTimes,
  "/ajustes/grupo": load.members,
  "/ajustes/medicamentos": load.medsList,
  "/ajustes/medicamentos/nuevo": load.medForm,
  "/ajustes/ejercicios": load.exercisesList,
  "/ajustes/ejercicios/nuevo": load.exerciseForm,
  "/ajustes/cuidados": load.caresList,
  "/ajustes/cuidados/nuevo": load.careForm,
  "/veterinarios": load.vetsList,
  "/veterinarios/nuevo": load.vetForm,
};

/**
 * Carga el chunk de una ruta sin navegar a ella.
 *
 * Silencioso a propósito: si la descarga falla, no hay nada que mostrar todavía y se
 * reintenta sola al entrar de verdad.
 */
export function preloadRoute(path: string): void {
  void preloaders[path]?.().catch(() => {});
}

/**
 * Props para un elemento que navega: calientan el chunk en cuanto se intuye el clic.
 *
 * Cubre el hueco de la precarga ociosa —pulsar antes de que el navegador tenga un
 * respiro—. En móvil no hay `pointerenter`, pero `pointerdown` llega unos milisegundos
 * antes que el `click`, y esos milisegundos son gratis.
 */
export const preloadOn = (path: string) => ({
  onPointerEnter: () => preloadRoute(path),
  onPointerDown: () => preloadRoute(path),
});

/** Azúcar para que TypeScript revise los `handle` en vez de tragarse cualquier objeto. */
const handle = (h: RouteHandle) => h;

/**
 * Medicamentos, ejercicios y cuidados cuelgan de `/ajustes` porque es desde ahí desde
 * donde se administran: así la pestaña activa sale sola de la URL y el enlace dice dónde
 * estás. Veterinarios queda arriba del todo, que se abre desde el header y no es de
 * ninguna pestaña.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomeScreen />,
        handle: handle({
          title: "Recordatorios de hoy",
          tab: "home",
          add: "choose",
          requiresPet: true,
        }),
      },

      {
        path: "agenda",
        element: <CalendarListScreen />,
        handle: handle({
          title: "Agenda",
          tab: "appointments",
          add: "/agenda/nueva",
          requiresPet: true,
        }),
      },
      {
        path: "agenda/nueva",
        element: <AddEditAppointmentScreen />,
        handle: handle({
          title: "Cita",
          tab: "appointments",
          parent: "/agenda",
          requiresPet: true,
        }),
      },
      {
        path: "agenda/:id",
        element: <AddEditAppointmentScreen />,
        handle: handle({
          title: "Cita",
          tab: "appointments",
          parent: "/agenda",
          requiresPet: true,
        }),
      },

      {
        path: "mascotas",
        element: <PetsListScreen />,
        handle: handle({
          title: "Mis mascotas",
          tab: "pets",
          add: "/mascotas/nueva",
        }),
      },
      {
        path: "mascotas/nueva",
        element: <AddEditPetScreen />,
        handle: handle({ title: "Mascota", tab: "pets", parent: "/mascotas" }),
      },
      {
        path: "mascotas/:id",
        element: <AddEditPetScreen />,
        handle: handle({ title: "Mascota", tab: "pets", parent: "/mascotas" }),
      },

      {
        path: "ajustes",
        element: <SettingsScreen />,
        handle: handle({ title: "Ajustes", tab: "settings" }),
      },
      {
        path: "ajustes/horarios",
        element: <MealTimesSettingsScreen />,
        handle: handle({
          title: "Horarios de comida",
          tab: "settings",
          parent: "/ajustes",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/grupo",
        element: <TenantMembersScreen />,
        handle: handle({ title: "Mi grupo", tab: "settings", parent: "/ajustes" }),
      },

      {
        path: "ajustes/medicamentos",
        element: <MedicationsListScreen />,
        handle: handle({
          title: "Medicamentos",
          tab: "settings",
          parent: "/ajustes",
          add: "/ajustes/medicamentos/nuevo",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/medicamentos/nuevo",
        element: <AddEditMedicationScreen />,
        handle: handle({
          title: "Medicamento",
          tab: "settings",
          parent: "/ajustes/medicamentos",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/medicamentos/:id",
        element: <AddEditMedicationScreen />,
        handle: handle({
          title: "Medicamento",
          tab: "settings",
          parent: "/ajustes/medicamentos",
          requiresPet: true,
        }),
      },

      {
        path: "ajustes/ejercicios",
        element: <ExercisesListScreen />,
        handle: handle({
          title: "Rutinas de ejercicio",
          tab: "settings",
          parent: "/ajustes",
          add: "/ajustes/ejercicios/nuevo",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/ejercicios/nuevo",
        element: <AddEditExerciseScreen />,
        handle: handle({
          title: "Rutina de ejercicio",
          tab: "settings",
          parent: "/ajustes/ejercicios",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/ejercicios/:id",
        element: <AddEditExerciseScreen />,
        handle: handle({
          title: "Rutina de ejercicio",
          tab: "settings",
          parent: "/ajustes/ejercicios",
          requiresPet: true,
        }),
      },

      {
        path: "ajustes/cuidados",
        element: <CaresListScreen />,
        handle: handle({
          title: "Cuidados operatorios",
          tab: "settings",
          parent: "/ajustes",
          add: "/ajustes/cuidados/nuevo",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/cuidados/nuevo",
        element: <AddEditCareScreen />,
        handle: handle({
          title: "Cuidado operatorio",
          tab: "settings",
          parent: "/ajustes/cuidados",
          requiresPet: true,
        }),
      },
      {
        path: "ajustes/cuidados/:id",
        element: <AddEditCareScreen />,
        handle: handle({
          title: "Cuidado operatorio",
          tab: "settings",
          parent: "/ajustes/cuidados",
          requiresPet: true,
        }),
      },

      {
        path: "veterinarios",
        element: <VeterinariansListScreen />,
        // Es una agenda de contactos que se consulta a mano: se ve sin mascotas. Su
        // formulario todavía exige `pet_id`, así que ese sí queda bloqueado.
        handle: handle({
          title: "Veterinarios",
          parent: "/",
          add: "/veterinarios/nuevo",
        }),
      },
      {
        path: "veterinarios/nuevo",
        element: <AddEditVeterinarianScreen />,
        handle: handle({
          title: "Veterinario",
          parent: "/veterinarios",
          requiresPet: true,
        }),
      },
      {
        path: "veterinarios/:id",
        element: <AddEditVeterinarianScreen />,
        handle: handle({
          title: "Veterinario",
          parent: "/veterinarios",
          requiresPet: true,
        }),
      },

      // Una URL inventada no debe dejar la app en blanco.
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
