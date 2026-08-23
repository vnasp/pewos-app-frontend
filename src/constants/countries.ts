/**
 * País → zona horaria.
 *
 * La app guarda una zona IANA porque es lo que define a qué hora vence un recordatorio,
 * pero nadie quiere elegir "America/Santiago" en una lista. El país es la pregunta que
 * una persona sí sabe responder.
 *
 * La correspondencia no es exacta: varios países tienen más de una zona. Se toma la del
 * grueso de la población, salvo Estados Unidos, donde elegir una sola sería equivocarse
 * para la mitad del país. Quien viva en una excepción —Magallanes, Isla de Pascua,
 * Amazonas— verá la hora mal, y por eso la pantalla la muestra debajo del selector: es
 * más fácil detectar "no son las 3 de la tarde" que revisar una zona IANA.
 */
export interface Country {
  /** Etiqueta que ve la persona. */
  name: string;
  /** Zona IANA que se guarda en el grupo. */
  timezone: string;
}

export const DEFAULT_TIMEZONE = "America/Santiago";

export const countries: Country[] = [
  { name: "Argentina", timezone: "America/Argentina/Buenos_Aires" },
  { name: "Bolivia", timezone: "America/La_Paz" },
  { name: "Brasil", timezone: "America/Sao_Paulo" },
  { name: "Chile", timezone: DEFAULT_TIMEZONE },
  { name: "Colombia", timezone: "America/Bogota" },
  { name: "Costa Rica", timezone: "America/Costa_Rica" },
  { name: "Cuba", timezone: "America/Havana" },
  { name: "Ecuador", timezone: "America/Guayaquil" },
  { name: "El Salvador", timezone: "America/El_Salvador" },
  { name: "España", timezone: "Europe/Madrid" },
  { name: "Estados Unidos (Este)", timezone: "America/New_York" },
  { name: "Estados Unidos (Centro)", timezone: "America/Chicago" },
  { name: "Estados Unidos (Montaña)", timezone: "America/Denver" },
  { name: "Estados Unidos (Pacífico)", timezone: "America/Los_Angeles" },
  { name: "Guatemala", timezone: "America/Guatemala" },
  { name: "Honduras", timezone: "America/Tegucigalpa" },
  { name: "México", timezone: "America/Mexico_City" },
  { name: "Nicaragua", timezone: "America/Managua" },
  { name: "Panamá", timezone: "America/Panama" },
  { name: "Paraguay", timezone: "America/Asuncion" },
  { name: "Perú", timezone: "America/Lima" },
  { name: "Puerto Rico", timezone: "America/Puerto_Rico" },
  { name: "República Dominicana", timezone: "America/Santo_Domingo" },
  { name: "Uruguay", timezone: "America/Montevideo" },
  { name: "Venezuela", timezone: "America/Caracas" },
];

/** El país cuya zona coincide, si alguno. Una zona fuera de la lista no tiene país. */
export function countryForTimezone(timezone: string): Country | undefined {
  return countries.find((country) => country.timezone === timezone);
}

/**
 * Qué hora es ahora en esa zona.
 *
 * Es la comprobación que sí entiende cualquiera: si no coincide con el reloj de la pared,
 * el país elegido está mal.
 */
export function currentTimeIn(timezone: string): string | null {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date());
  } catch {
    // Una zona que el navegador no conoce no puede tumbar la pantalla entera.
    return null;
  }
}
