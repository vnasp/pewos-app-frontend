import { describe, expect, test } from "vitest";

import { ImageError, preparePhoto } from "./image";

/**
 * Solo se cubren las guardas, que corren antes de tocar el DOM.
 *
 * El redimensionado y el reencodeado necesitan un canvas de verdad, y estos tests corren
 * en `node`. Comprobar que Safari cae al JPEG, por ejemplo, pide un navegador.
 */

/** `preparePhoto` solo lee `type` y `size` antes de rechazar, así que no hace falta un
 * archivo real: uno de 21 MB solo para probar el tope sería memoria tirada. */
const archivo = (type: string, size: number) => ({ type, size }) as File;

const MB = 1024 * 1024;

describe("preparePhoto", () => {
  test("rechaza lo que no es una imagen de las que acepta la API", async () => {
    await expect(preparePhoto(archivo("application/pdf", 1024))).rejects.toThrow(ImageError);
  });

  test("rechaza un GIF aunque sea una imagen", async () => {
    // La API valida el content-type con un Literal de tres tipos; un GIF daría 422 al
    // pedir la URL prefirmada, y es mejor decirlo antes de crear la mascota.
    await expect(preparePhoto(archivo("image/gif", 1024))).rejects.toThrow(ImageError);
  });

  test("rechaza un archivo demasiado grande para decodificarlo sin riesgo", async () => {
    await expect(preparePhoto(archivo("image/jpeg", 21 * MB))).rejects.toThrow(
      /20 MB/,
    );
  });

  test("deja pasar una foto normal de teléfono hacia el procesado", async () => {
    // No llega a convertir —no hay DOM—, pero confirma que 6 MB no topan con la guarda.
    await expect(preparePhoto(archivo("image/jpeg", 6 * MB))).rejects.not.toThrow(
      /20 MB/,
    );
  });
});
