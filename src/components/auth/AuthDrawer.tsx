import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

/** Arrastre a partir del cual soltar cierra, en vez de devolver la hoja a su sitio. */
const CLOSE_THRESHOLD = 80;
/** Por debajo de esto el dedo tembló: fue un toque, no un arrastre. */
const DRAG_SLOP = 5;

export interface DrawerGeometry {
  /** Cuánto de la hoja se ve: su alto, menos lo que lleve arrastrado. */
  visibleHeight: number;
  dragging: boolean;
}

interface AuthDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Debe ser estable: se llama desde un efecto. */
  onGeometryChange: (geometry: DrawerGeometry) => void;
  children: ReactNode;
}

/**
 * La hoja blanca con el formulario. Se cierra arrastrando el asa hacia abajo, tocándola
 * o con Escape.
 *
 * Reporta hacia arriba cuánto de sí misma se ve —y no su alto— porque el cachorro se
 * apoya en su borde superior: si durante el arrastre se quedara quieto, asomaría una
 * franja de degradado entre sus patas y la hoja.
 */
function AuthDrawer({
  open,
  onClose,
  onGeometryChange,
  children,
}: AuthDrawerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [drag, setDrag] = useState(0);

  const startY = useRef(0);
  const dragRef = useRef(0);
  const grabbing = useRef(false);
  const moved = useRef(false);

  // Se mide en vez de calcularse porque el alto cambia entre login y registro.
  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const update = () => setHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onGeometryChange({
      visibleHeight: Math.max(height - drag, 0),
      dragging: drag > 0,
    });
  }, [height, drag, onGeometryChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    startY.current = e.clientY;
    grabbing.current = true;
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!grabbing.current) return;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > DRAG_SLOP) moved.current = true;
    // Solo hacia abajo: tirar hacia arriba no descubre nada, la hoja ya está entera.
    dragRef.current = Math.max(dy, 0);
    setDrag(dragRef.current);
  };

  const endDrag = (shouldClose: boolean) => {
    if (!grabbing.current) return;
    grabbing.current = false;
    dragRef.current = 0;
    setDrag(0);
    if (shouldClose) onClose();
  };

  const handleClick = () => {
    // Tras arrastrar el navegador dispara igual un click, y cerrar aquí desharía el
    // "vuelve a su sitio" de un arrastre corto. El toque limpio sí cierra.
    if (moved.current) {
      moved.current = false;
      return;
    }
    onClose();
  };

  return (
    <div
      ref={sheetRef}
      // `inert` y no `aria-hidden`: además de ocultarla al lector de pantalla saca del
      // orden de tabulación los inputs, que si no se pueden enfocar estando fuera de vista.
      inert={!open}
      className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-sheet shadow-float max-h-[86svh] overflow-y-auto transition-transform duration-500 ease-out"
      // La posición va entera por `transform`: en Tailwind 4 `translate-y-full` usa la
      // propiedad `translate`, que se compondría con esto en vez de sobrescribirlo.
      style={{
        transform: open ? `translateY(${drag}px)` : "translateY(100%)",
        transition: drag > 0 ? "none" : undefined,
      }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => endDrag(dragRef.current > CLOSE_THRESHOLD)}
        onPointerCancel={() => endDrag(false)}
        onClick={handleClick}
        // `touch-none` solo aquí: en el resto de la hoja el navegador sigue haciendo
        // scroll y dejando poner el cursor en los campos.
        className="w-full flex justify-center pt-3 pb-5 touch-none cursor-grab active:cursor-grabbing"
      >
        <span className="block w-9 h-1 rounded-full bg-line" />
      </button>
      <div className="px-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}

export default AuthDrawer;
