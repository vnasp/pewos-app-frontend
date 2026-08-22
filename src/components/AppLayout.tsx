import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { usePets } from "../hooks/queries";
import { useNotificationScheduler } from "../hooks/useNotificationScheduler";
import { useTodayEvents } from "../hooks/useTodayEvents";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { addActionFor, titleFor } from "../navigation";
import type { SubScreen, Tab } from "../navigation";
import { requestNotificationPermission } from "../utils/notifications";
import { today } from "../utils/date";
import AddSheet from "./AddSheet";
import Header from "./Header";
import PetFilterTabs from "./home/PetFilterTabs";
import InstallBanner from "./InstallBanner";
import TabBar from "./TabBar";
import Fab from "./ui/Fab";

// Screens
import AddEditAppointmentScreen from "../screens/AddEditAppointmentScreen";
import AddEditCareScreen from "../screens/AddEditCareScreen";
import AddEditExerciseScreen from "../screens/AddEditExerciseScreen";
import AddEditMedicationScreen from "../screens/AddEditMedicationScreen";
import AddEditPetScreen from "../screens/AddEditPetScreen";
import AddEditVeterinarianScreen from "../screens/AddEditVeterinarianScreen";
import CalendarListScreen from "../screens/CalendarListScreen";
import CaresListScreen from "../screens/CaresListScreen";
import ExercisesListScreen from "../screens/ExercisesListScreen";
import HomeScreen from "../screens/HomeScreen";
import MealTimesSettingsScreen from "../screens/MealTimesSettingsScreen";
import MedicationsListScreen from "../screens/MedicationsListScreen";
import PetsListScreen from "../screens/PetsListScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TenantMembersScreen from "../screens/TenantMembersScreen";
import VeterinariansListScreen from "../screens/VeterinariansListScreen";

export default function AppLayout() {
  const { canWrite } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>("home");
  const [subScreen, setSubScreen] = useState<SubScreen>({ kind: "none" });
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  // El filtro de mascota se dibuja sobre el degradado, que es del header, pero filtra la
  // lista de Hoy. Por eso el estado y la derivación viven aquí y bajan como props.
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const { items: pets } = usePets();
  const { events, isLoading: loadingEvents } = useTodayEvents();

  // Pedir permiso de notificación al montar y programar notificaciones de hoy
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  useNotificationScheduler();
  usePushSubscription(); // Web Push (iOS Safari + Android background)

  const isSubScreen = subScreen.kind !== "none";
  const back = () => setSubScreen({ kind: "none" });

  const handleTabNavigate = (tab: Tab) => {
    setSubScreen({ kind: "none" });
    setCurrentTab(tab);
  };

  const addAction = canWrite ? addActionFor(currentTab, subScreen) : null;
  const handleAdd = () => {
    if (addAction === "choose") setAddSheetOpen(true);
    else if (addAction) setSubScreen(addAction);
  };

  const renderContent = () => {
    switch (subScreen.kind) {
      case "addEditPet":
        return <AddEditPetScreen petId={subScreen.petId} onNavigateBack={back} />;
      case "addEditAppointment":
        return (
          <AddEditAppointmentScreen
            appointmentId={subScreen.appointmentId}
            onNavigateBack={back}
          />
        );
      case "addEditMedication":
        return (
          <AddEditMedicationScreen
            medicationId={subScreen.medicationId}
            onNavigateBack={back}
          />
        );
      case "addEditExercise":
        return (
          <AddEditExerciseScreen
            exerciseId={subScreen.exerciseId}
            onNavigateBack={back}
          />
        );
      case "addEditCare":
        return (
          <AddEditCareScreen careId={subScreen.careId} onNavigateBack={back} />
        );
      case "mealTimes":
        return <MealTimesSettingsScreen />;
      case "members":
        return <TenantMembersScreen />;
      case "medications":
        return (
          <MedicationsListScreen
            onNavigateToAddEdit={(id) =>
              setSubScreen({ kind: "addEditMedication", medicationId: id })
            }
          />
        );
      case "exercises":
        return (
          <ExercisesListScreen
            onNavigateToAddEdit={(id) =>
              setSubScreen({ kind: "addEditExercise", exerciseId: id })
            }
          />
        );
      case "cares":
        return (
          <CaresListScreen
            onNavigateToAddEdit={(id) =>
              setSubScreen({ kind: "addEditCare", careId: id })
            }
          />
        );
      case "veterinarians":
        return (
          <VeterinariansListScreen
            onNavigateToAddEdit={(id) =>
              setSubScreen({ kind: "addEditVeterinarian", veterinarianId: id })
            }
          />
        );
      case "addEditVeterinarian":
        return (
          <AddEditVeterinarianScreen
            veterinarianId={subScreen.veterinarianId}
            onNavigateBack={back}
          />
        );
    }

    switch (currentTab) {
      case "home":
        return (
          <HomeScreen
            events={events}
            isLoading={loadingEvents}
            selectedPetId={selectedPetId}
          />
        );
      case "pets":
        return (
          <PetsListScreen
            onNavigateToAddEdit={(id) =>
              setSubScreen({ kind: "addEditPet", petId: id })
            }
            onNavigateToMealTimes={() => setSubScreen({ kind: "mealTimes" })}
          />
        );
      case "appointments":
        return (
          <CalendarListScreen
            onNavigateToAddEdit={(id) =>
              setSubScreen({ kind: "addEditAppointment", appointmentId: id })
            }
          />
        );
      case "settings":
        return (
          <SettingsScreen
            onNavigateToMealTimes={() => setSubScreen({ kind: "mealTimes" })}
            onNavigateToMembers={() => setSubScreen({ kind: "members" })}
            onNavigateToMedications={() => setSubScreen({ kind: "medications" })}
            onNavigateToExercises={() => setSubScreen({ kind: "exercises" })}
            onNavigateToCares={() => setSubScreen({ kind: "cares" })}
          />
        );
    }
  };

  const isHome = !isSubScreen && currentTab === "home";

  const countByPet = events.reduce<Record<string, number>>((acc, ev) => {
    acc[ev.data.pet_id] = (acc[ev.data.pet_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-svh w-full overflow-hidden">
      <InstallBanner />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <TabBar
          currentTab={currentTab}
          onNavigate={handleTabNavigate}
          className="order-2 lg:order-1"
        />

        <div className="relative flex flex-col flex-1 overflow-hidden order-1 lg:order-2">
          <Header
            title={titleFor(currentTab, subScreen)}
            date={isHome ? today() : undefined}
            onBack={isSubScreen ? back : undefined}
            onVetPress={
              isSubScreen ? undefined : () => setSubScreen({ kind: "veterinarians" })
            }
          >
            {isHome && (
              <PetFilterTabs
                pets={pets}
                selectedPetId={selectedPetId}
                onSelect={setSelectedPetId}
                totalCount={events.length}
                countByPet={countByPet}
              />
            )}
          </Header>
          <main className="flex-1 bg-white rounded-t-sheet -mt-6 overflow-y-auto relative z-10 lg:max-w-6xl lg:mx-auto lg:w-full">
            {renderContent()}
          </main>

          {addAction && <Fab onClick={handleAdd} label="Agregar" />}
        </div>
      </div>

      <AddSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSelect={setSubScreen}
      />
    </div>
  );
}
