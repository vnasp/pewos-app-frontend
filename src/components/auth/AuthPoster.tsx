import AuthHeadline from "./AuthHeadline";
import FloatingShapes from "./FloatingShapes";

/**
 * La mitad derecha de la portada de escritorio: el cartel de la app.
 *
 * Titular arriba y cachorro en lo que sobra debajo, como dos filas de un flex. La foto no
 * puede invadir el texto porque no comparte espacio con él, sin depender de que las
 * cuentas salgan a cada proporción de ventana.
 *
 * Usa un recorte propio del asset y no el de móvil: aquel tiene la mitad de arriba
 * transparente —el cachorro asoma por abajo para apoyarse en el borde del drawer— y con
 * `object-contain` ese vacío contaría como imagen, dejando al cachorro a la mitad de
 * tamaño en una columna llena de degradado. El recorte también corta la tabla celeste por
 * la mitad, para que se lea como repisa que sigue fuera de cuadro y no como una franja.
 *
 * No usa `PuppyPhoto` a propósito: ese componente bloquea `selectstart` en todo el
 * documento, porque en móvil la foto ocupa casi la pantalla entera y arrastrar sobre ella
 * seleccionaba texto. Aquí el mismo listener impediría seleccionar lo escrito en los
 * campos de la columna de al lado; `select-none` en la propia imagen no se sale de ella.
 */
function AuthPoster() {
  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden bg-brand-gradient">
      {/* Antes que la foto en el DOM: el cachorro está recortado sobre transparencia y
          los deja ver a través suyo. */}
      <FloatingShapes />

      <div className="relative z-20 shrink-0 px-8 pt-16 xl:pt-24">
        <AuthHeadline />
      </div>

      {/* `w-full` con el alto en auto: la foto ocupa el ancho entero, para que la repisa
          llegue a los dos bordes en vez de quedar flotando. `max-h-full` es la salida para
          ventanas muy bajas, donde en vez de comerse la cabeza del cachorro lo encoge. */}
      <div className="relative z-10 flex min-h-0 flex-1 items-end pt-8">
        <img
          src="/assets/onboarding-poster.webp"
          alt=""
          className="w-full max-h-full select-none object-contain object-bottom"
          fetchPriority="high"
          draggable={false}
        />
      </div>
    </div>
  );
}

export default AuthPoster;
