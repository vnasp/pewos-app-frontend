interface AuthHeadlineProps {
  /** Se retira al abrir el drawer: con el formulario arriba el protagonismo es suyo. */
  hidden: boolean;
}

/** La promesa de la portada. */
function AuthHeadline({ hidden }: AuthHeadlineProps) {
  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 px-5 pt-[env(safe-area-inset-top)] transition-opacity duration-300 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
      // `opacity-0` por sí solo sigue siendo visible para un lector de pantalla.
      inert={hidden}
    >
      <h1 className="pt-20 text-center text-4xl text-white leading-tight tracking-tight">
        <span className="font-medium">Toda la agenda de</span>
        <br />
        <span className="font-extrabold">tu mascota</span>
        <br />
        <span className="font-medium">en un solo lugar</span>
      </h1>
    </div>
  );
}

export default AuthHeadline;
