/**
 * Vocabulario de navegación: las pestañas de la barra y lo que cada ruta le declara al
 * shell (título, pestaña activa, a dónde vuelve la flecha, qué crea el "+").
 *
 * Antes esto eran tres `switch` —`titleFor`, `addActionFor` y `requiresPet`— sobre una
 * unión `SubScreen` de trece miembros, y agregar una pantalla obligaba a tocar los tres
 * sin que nada avisara si te saltabas uno. Ahora cada ruta lleva lo suyo encima, en su
 * `handle`, y el shell solo lee.
 */

export type Tab = "home" | "appointments" | "pets" | "settings";

export interface RouteHandle {
  /** Título que pinta el Header. */
  title: string;
  /**
   * Pestaña que queda marcada en la barra. Sin ella no se marca ninguna: Veterinarios
   * se abre desde el header y no pertenece a ninguna.
   */
  tab?: Tab;
  /**
   * A dónde vuelve la flecha del header; sin ella no hay flecha. Es una ruta concreta y
   * no `navigate(-1)` porque quien llega por un enlace compartido no tiene historial
   * atrás y la flecha lo sacaría de la app.
   */
  parent?: string;
  /**
   * A dónde lleva el "+". `"choose"` abre la hoja de Hoy, que pregunta qué crear porque
   * ahí conviven las cuatro categorías. Sin `add` no hay "+".
   */
  add?: string;
  /** No hay nada que listar ni forma válida de crear sin una mascota registrada. */
  requiresPet?: boolean;
}
