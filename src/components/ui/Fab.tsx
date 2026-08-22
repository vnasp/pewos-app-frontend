import { Plus } from "lucide-react";

interface FabProps {
  onClick: () => void;
  label: string;
}

/**
 * Botón flotante de agregar.
 *
 * Su contenedor termina donde empieza la TabBar (son hermanos en el flex column), así que
 * `bottom-5` ya lo deja justo encima de la barra. Quien tiene que reservar espacio es la
 * lista, con su `padding-bottom`, o el FAB taparía la última tarjeta.
 */
export default function Fab({ onClick, label }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute end-5 bottom-5 z-30 w-14 h-14 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-fab active:scale-95 transition-transform"
    >
      <Plus size={26} strokeWidth={2.5} aria-hidden />
    </button>
  );
}
