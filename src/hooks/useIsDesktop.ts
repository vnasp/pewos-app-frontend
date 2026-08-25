import { useSyncExternalStore } from "react";

/** El mismo corte que `lg:` en Tailwind, para que CSS y JS no discrepen. */
const DESKTOP = "(min-width: 1024px)";

let query: MediaQueryList | null = null;

function media() {
  query ??= window.matchMedia(DESKTOP);
  return query;
}

function subscribe(onChange: () => void) {
  const mq = media();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Si la ventana da para dos columnas.
 *
 * La portada no es la misma pantalla en móvil y en escritorio, sino dos: una monta el
 * drawer arrastrable y la otra el formulario a la vista. Resolverlo con `hidden lg:block`
 * montaría las dos a la vez y dejaría dos `id="email"` en el DOM, con lo que los `<label>`
 * apuntarían al campo equivocado.
 *
 * `matchMedia` resuelve ya en el primer render —no hay SSR que hidratar—, así que no se
 * pinta una rama para cambiarla enseguida por la otra.
 */
export function useIsDesktop() {
  return useSyncExternalStore(subscribe, () => media().matches);
}
