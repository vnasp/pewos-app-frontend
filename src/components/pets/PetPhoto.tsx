import { useState, type ReactNode } from "react";

interface PetPhotoProps {
  url: string | null;
  alt: string;
  /** Lo que se muestra sin foto, o cuando la que hay no carga. */
  fallback: ReactNode;
  className?: string;
}

/**
 * La foto de una mascota, con respaldo si no carga.
 *
 * `photo_url` es una URL firmada sobre un bucket privado, así que puede quedar apuntando
 * a algo que ya no está: alguien borró el objeto, la subida se cortó a medias, la firma
 * venció. Sin esto el navegador dibuja su icono de imagen rota, que es peor que no
 * enseñar nada.
 */
function PetPhoto({
  url,
  alt,
  fallback,
  className = "w-full h-full object-cover",
}: PetPhotoProps) {
  // Se guarda cuál falló y no un booleano: así una foto nueva vuelve a intentarlo sola,
  // sin necesitar un efecto que resetee el estado cuando cambia la prop.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  if (!url || url === brokenUrl) return <>{fallback}</>;

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setBrokenUrl(url)}
      className={className}
    />
  );
}

export default PetPhoto;
