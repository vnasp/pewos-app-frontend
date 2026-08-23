export type TipCategory = "alimentacion" | "enriquecimiento" | "hidratacion" | "rutina";

export interface Tip {
  id: string;
  category: TipCategory;
  title: string;
  content: string;
}

/**
 * Consejos de alimentación.
 *
 * Deliberadamente generales: ninguno da cantidades ni frecuencias concretas, porque eso
 * depende de la mascota y lo dice su veterinario, no una app.
 *
 * Todos rondan las 16 palabras a propósito: iban de 13 a 24, y la tarjeta cambiaba de
 * alto según el consejo que tocara al entrar.
 */
export const tips: Tip[] = [
  {
    id: "tip-001",
    category: "alimentacion",
    title: "Comidas en horarios",
    content:
      "Mantener horarios regulares puede ayudar a crear una rutina y facilitar el control de la alimentación.",
  },
  {
    id: "tip-002",
    category: "enriquecimiento",
    title: "Comida más entretenida",
    content:
      "Usa juguetes dispensadores o alfombras de lamido para convertir parte de la comida en una actividad de enriquecimiento.",
  },
  {
    id: "tip-003",
    category: "alimentacion",
    title: "Cantidad adecuada",
    content:
      "La cantidad de alimento depende del peso, la edad, la actividad y del alimento específico que consume.",
  },
  {
    id: "tip-004",
    category: "hidratacion",
    title: "Agua fresca",
    content:
      "Asegúrate de que tu mascota tenga acceso permanente a agua limpia y fresca, también fuera de comidas.",
  },
  {
    id: "tip-005",
    category: "enriquecimiento",
    title: "Comer más lento",
    content:
      "Si tu mascota come muy rápido, un comedero lento puede ayudar a prolongar el tiempo de comida.",
  },
  {
    id: "tip-006",
    category: "alimentacion",
    title: "Cambios graduales",
    content:
      "Cuando cambies de alimento, haz la transición de forma gradual durante varios días para evitar molestias digestivas.",
  },
  {
    id: "tip-007",
    category: "rutina",
    title: "Evita demasiados premios",
    content:
      "Los snacks y premios también aportan calorías, por lo que conviene considerarlos dentro de la alimentación diaria.",
  },
  {
    id: "tip-008",
    category: "alimentacion",
    title: "Divide las porciones",
    content:
      "Distribuir la cantidad diaria en varias comidas puede evitar porciones abundantes y mantener una rutina más regular.",
  },
];

export const tipStyles: Record<
  TipCategory,
  { label: string; fg: string; back: string }
> = {
  alimentacion: {
    label: "Alimentación",
    fg: "text-amber-600",
    back: "bg-amber-200",
  },
  enriquecimiento: {
    label: "Enriquecimiento",
    fg: "text-violet-600",
    back: "bg-violet-200",
  },
  hidratacion: {
    label: "Hidratación",
    fg: "text-sky-600",
    back: "bg-sky-200",
  },
  rutina: {
    label: "Rutina",
    fg: "text-emerald-600",
    back: "bg-emerald-200",
  },
};

/** Uno al azar, elegido al entrar a la pantalla. */
export function randomTip(): Tip {
  return tips[Math.floor(Math.random() * tips.length)];
}
