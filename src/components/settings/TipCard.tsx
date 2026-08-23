import { useState } from "react";

import { randomTip, tipStyles, type Tip } from "../../constants/tips";

/**
 * Un consejo al azar, sobre dos rectángulos superpuestos.
 *
 * El de atrás va girado y desplazado para romper la retícula: toda esta pantalla son
 * tarjetas rectangulares alineadas, y un consejo es un aparte, no una fila más de la
 * lista. La forma lo dice antes de leerlo.
 *
 * La categoría ya se lee en el color del rectángulo de atrás y en su etiqueta; un icono
 * encima repetía el mismo dato por tercera vez.
 */
function TipCard() {
  // Se elige una vez al montar y no en cada render: si no, cambiaría al escribir en
  // cualquier campo de la pantalla. Cambia al volver a entrar, y ahí se queda quieto.
  const [tip] = useState<Tip>(() => randomTip());
  const { label, fg, back } = tipStyles[tip.category];

  return (
    <div className="relative mt-8">
      {/* Puramente decorativo: fuera del árbol de accesibilidad. */}
      <div
        aria-hidden
        className={`absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-3xl ${back} opacity-60`}
      />

      <div className="relative bg-white rounded-3xl p-5 shadow-card">
        <p className={`text-xs font-bold uppercase tracking-wide ${fg}`}>{label}</p>
        <p className="text-ink font-bold mt-0.5">{tip.title}</p>
        <p className="text-muted text-sm mt-1 leading-relaxed">{tip.content}</p>
      </div>
    </div>
  );
}

export default TipCard;
