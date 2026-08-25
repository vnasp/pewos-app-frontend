/**
 * La promesa de la portada.
 *
 * Solo el texto: dónde va y cuándo se retira lo decide quien lo monta, porque no es lo
 * mismo en las dos portadas —en móvil se aparta al subir el drawer, en escritorio vive
 * fijo en la columna del cartel—. La copy, en cambio, se escribe una sola vez.
 *
 * `xl:` solo alcanza a la portada de escritorio: ningún teléfono llega a 1280px, y a esa
 * anchura la rama que está montada es siempre la de dos columnas.
 */
function AuthHeadline() {
  return (
    <h1 className="text-center text-4xl xl:text-5xl text-white leading-tight tracking-tight">
      <span className="font-medium">Toda la agenda de</span>
      <br />
      <span className="font-extrabold">tu mascota</span>
      <br />
      <span className="font-medium">en un solo lugar</span>
    </h1>
  );
}

export default AuthHeadline;
