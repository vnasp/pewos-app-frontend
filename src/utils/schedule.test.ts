import { describe, expect, test } from "vitest";

import { groupByTimeOfDay } from "./schedule";

/** Mínimo que necesita `groupByTimeOfDay`: solo mira `time`. */
const at = (time: string) => ({ time });

/** Busca por id y no por posición: los momentos vacíos se descartan y corren los índices. */
const momento = (groups: ReturnType<typeof groupByTimeOfDay>, id: string) =>
  groups.find((g) => g.id === id)?.events;

describe("groupByTimeOfDay", () => {
  test("devuelve los tres momentos en orden mañana, tarde, noche", () => {
    const groups = groupByTimeOfDay([at("20:00"), at("08:00"), at("15:00")]);

    expect(groups.map((g) => g.id)).toEqual(["morning", "afternoon", "night"]);
  });

  test("11:59 es mañana y 12:00 ya es tarde", () => {
    const groups = groupByTimeOfDay([at("11:59"), at("12:00")]);

    expect(momento(groups, "morning")).toEqual([at("11:59")]);
    expect(momento(groups, "afternoon")).toEqual([at("12:00")]);
  });

  test("18:59 es tarde y 19:00 ya es noche", () => {
    const groups = groupByTimeOfDay([at("18:59"), at("19:00")]);

    expect(momento(groups, "afternoon")).toEqual([at("18:59")]);
    expect(momento(groups, "night")).toEqual([at("19:00")]);
  });

  test("descarta los momentos sin eventos", () => {
    const groups = groupByTimeOfDay([at("09:00")]);

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("morning");
  });

  test("sin eventos devuelve una lista vacía", () => {
    expect(groupByTimeOfDay([])).toEqual([]);
  });

  test("conserva el orden de entrada dentro de cada momento", () => {
    const groups = groupByTimeOfDay([at("08:00"), at("09:30"), at("10:15")]);

    expect(groups[0].events).toEqual([at("08:00"), at("09:30"), at("10:15")]);
  });

  test("cada momento trae su etiqueta para mostrar", () => {
    const groups = groupByTimeOfDay([at("08:00"), at("15:00"), at("21:00")]);

    expect(groups.map((g) => g.label)).toEqual(["Mañana", "Tarde", "Noche"]);
  });
});
