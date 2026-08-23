import { useEffect } from "react";

import { preloadRoute } from "../routes";

/** Las pestañas se visitan seguro, así que no se espera a que nadie las apunte. */
const TAB_ROUTES = ["/agenda", "/mascotas", "/ajustes"];

/**
 * Calienta los chunks de las rutas probables mientras el navegador está ocioso.
 *
 * Es lo que evita que `lazy` se pague en velocidad: nada de esto entra en la carga
 * inicial, pero para cuando se pulsa ya está en memoria y navegar no espera a la red.
 *
 * `addPath` es el destino del "+" de la pantalla actual —el alta de la lista que estás
 * mirando—, que comparte componente con la edición: calentarlo cubre las dos.
 */
export function usePreloadRoutes(addPath?: string) {
  useEffect(() => {
    const targets = [
      ...TAB_ROUTES,
      ...(addPath && addPath !== "choose" ? [addPath] : []),
    ];
    const warm = () => targets.forEach(preloadRoute);

    // `requestIdleCallback` no está en Safari antes de 16.4; el respiro del timeout
    // basta para no competir con el primer render.
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(warm);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 1500);
    return () => clearTimeout(id);
  }, [addPath]);
}
