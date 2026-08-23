/**
 * Círculos que flotan al fondo de la portada.
 *
 * Van antes que la foto en el orden del DOM: el cachorro está recortado sobre
 * transparencia y los deja ver a través suyo.
 */
function FloatingShapes() {
  return (
    <>
      <div className="absolute rounded-full bg-white/10 animate-float-up w-75 h-75 -top-37.5 -right-25" />
      <div className="absolute rounded-full bg-white/8 animate-float-down w-62.5 h-62.5 top-1/3 -left-20" />
      <div className="absolute rounded-full animate-pulse-ring w-100 h-100 top-1/2 left-1/2 bg-white/10" />
      <div
        className="absolute rounded-full animate-pulse-ring-slow w-100 h-100 top-1/2 left-1/2 bg-white/8"
        style={{ animationDelay: "1.5s" }}
      />
    </>
  );
}

export default FloatingShapes;
