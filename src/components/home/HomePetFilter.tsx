import { useSearchParams } from "react-router";

import { usePets } from "../../hooks/queries";
import { useTodayEvents } from "../../hooks/useTodayEvents";
import PetFilterTabs from "./PetFilterTabs";

/**
 * Los chips de filtro por mascota que van sobre el degradado del header.
 *
 * Existe como componente propio, y no como un trozo de `AppLayout`, para que sus queries
 * solo se pidan donde se usan: contar los recordatorios de hoy cuesta cuatro consultas
 * —citas, medicamentos, ejercicios y cuidados— y antes salían en cada ruta, incluidas
 * "Mi grupo" o "Veterinarios", que no pintan ningún chip.
 *
 * El filtro vive en la URL y no en un estado compartido: es lo único que este componente
 * y `HomeScreen` necesitan compartir, y de paso el botón atrás lo deshace y el enlace de
 * "los recordatorios de Luna" se puede mandar.
 */
function HomePetFilter() {
  const { active: pets } = usePets();
  const { events } = useTodayEvents();
  const [searchParams, setSearchParams] = useSearchParams();

  const countByPet = events.reduce<Record<string, number>>((acc, ev) => {
    acc[ev.data.pet_id] = (acc[ev.data.pet_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PetFilterTabs
      pets={pets}
      selectedPetId={searchParams.get("mascota")}
      // `replace` para que filtrar no llene el historial de pasos intermedios.
      onSelect={(id) =>
        setSearchParams(id ? { mascota: id } : {}, { replace: true })
      }
      totalCount={events.length}
      countByPet={countByPet}
    />
  );
}

export default HomePetFilter;
