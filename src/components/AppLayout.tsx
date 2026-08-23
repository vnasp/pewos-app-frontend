import { Suspense, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext";
import { usePets } from "../hooks/queries";
import { usePreloadRoutes } from "../hooks/usePreloadRoutes";
import type { RouteHandle } from "../navigation";
import { today } from "../utils/date";
import AddSheet from "./AddSheet";
import Header from "./Header";
import PetGuard from "./PetGuard";
import HomePetFilter from "./home/HomePetFilter";
import TabBar from "./TabBar";
import Fab from "./ui/Fab";
import Spinner from "./ui/Spinner";

/**
 * El marco que rodea a todas las pantallas: header, barra de pestañas y botón "+".
 *
 * No sabe qué hay debajo. Cada ruta declara en su `handle` el título, la pestaña que
 * queda marcada, a dónde vuelve la flecha y qué crea el "+"; esto solo lo lee. Antes era
 * una tabla de despacho con dos `switch` y bajaba media docena de callbacks por props.
 */
function AppLayout() {
  const { canWrite } = useAuth();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  // Única query que el marco necesita en todas las rutas: el guard depende de ella.
  const { active: pets, isLoading: loadingPets } = usePets();
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();

  const handle = (matches.at(-1)?.handle ?? { title: "" }) as RouteHandle;
  const isHome = location.pathname === "/";

  // `loadingPets` importa: sin él la lista llega vacía en el primer render y el guard
  // parpadea antes de que se resuelva la query.
  const noPets = !loadingPets && pets.length === 0;
  const guarded = noPets && handle.requiresPet === true;

  const addTarget = canWrite && !guarded ? handle.add : undefined;
  const handleAdd = () => {
    if (addTarget === "choose") setAddSheetOpen(true);
    else if (addTarget) navigate(addTarget);
  };

  usePreloadRoutes(handle.add);

  return (
    <div className="flex flex-col h-svh w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <TabBar className="order-2 lg:order-1" />

        <div className="relative flex flex-col flex-1 overflow-hidden order-1 lg:order-2">
          <Header
            title={handle.title}
            date={isHome ? today() : undefined}
            onBack={handle.parent ? () => navigate(handle.parent!) : undefined}
            // El acceso a Veterinarios solo desde una pantalla raíz, que es donde hay
            // sitio: las de detalle ya usan ese hueco para la flecha de volver.
            onVetPress={
              handle.parent ? undefined : () => navigate("/veterinarios")
            }
          >
            {isHome && <HomePetFilter />}
          </Header>

          <main className="flex-1 bg-white rounded-t-sheet -mt-6 overflow-y-auto relative z-10 lg:max-w-6xl lg:mx-auto lg:w-full">
            {guarded ? (
              <PetGuard
                canWrite={canWrite}
                onAddPet={() => navigate("/mascotas/nueva")}
              />
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            )}
          </main>

          {addTarget && <Fab onClick={handleAdd} label="Agregar" />}
        </div>
      </div>

      <AddSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSelect={(path) => navigate(path)}
      />
    </div>
  );
}

export default AppLayout;
