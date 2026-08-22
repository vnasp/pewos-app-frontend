/**
 * Prepara una foto antes de subirla a S3.
 *
 * Redibujarla en un canvas la reduce, la reencodea y, de paso, le quita todos los
 * metadatos. Eso último importa más de lo que parece: una foto de teléfono lleva las
 * coordenadas GPS de donde se tomó, y estas fotos se comparten con el grupo.
 *
 * El tamaño también es una defensa: una URL prefirmada de PUT acepta cualquier archivo,
 * sin límite posible desde la API. Reducir en el cliente es lo único que evita que una
 * foto de 6 MB viaje entera por datos móviles.
 */

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Tope del archivo de entrada, no del resultado.
 *
 * No es por el peso —el reencodeado lo resuelve— sino porque decodificar una imagen de
 * cien megapíxeles puede tumbar la pestaña en un móvil antes de llegar al canvas.
 */
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

/** 4,5 veces el render más grande (112 px), con margen para pantallas densas. */
const MAX_SIDE = 512;
const QUALITY = 0.85;

export class ImageError extends Error {}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageError("No se pudo leer la imagen"));
    image.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function preparePhoto(file: File): Promise<Blob> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new ImageError("La foto debe ser JPG, PNG o WebP");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageError("La foto no puede pesar más de 20 MB");
  }

  const url = URL.createObjectURL(file);
  let image: HTMLImageElement;
  try {
    image = await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }

  // `naturalWidth` ya viene rotado según el EXIF: los navegadores aplican la orientación
  // a un `<img>` por defecto. Con `createImageBitmap` habría que pedirlo a mano.
  const side = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, MAX_SIDE / side);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new ImageError("No se pudo procesar la imagen");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Safari anterior a 16.4 ignora el tipo pedido y devuelve un PNG sin avisar, y un PNG
  // de una fotografía pesa más que el JPEG del que salió. Por eso se comprueba lo que
  // devolvió y no lo que se pidió, y el respaldo es JPEG y no el original.
  const webp = await toBlob(canvas, "image/webp");
  if (webp?.type === "image/webp") return webp;

  const jpeg = await toBlob(canvas, "image/jpeg");
  if (jpeg) return jpeg;

  throw new ImageError("No se pudo procesar la imagen");
}
