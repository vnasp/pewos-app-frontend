import { defineConfig } from "vitest/config";

/**
 * Configuración propia, separada de `vite.config.ts`: los tests solo cubren lógica pura
 * (derivación de eventos y agrupación horaria), así que no necesitan React, Tailwind ni
 * el plugin de PWA, que además ralentizan y ensucian la salida.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
