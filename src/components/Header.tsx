import { ArrowLeft, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";

import { formatLongDate } from "../utils/date";

interface HeaderProps {
  title: string;
  /** Fecha ISO a mostrar como antetítulo. Sin ella no se muestra antetítulo. */
  date?: string;
  onBack?: () => void;
  onVetPress?: () => void;
  /** Chips de filtro por mascota, solo en Hoy. */
  children?: ReactNode;
}

export default function Header({
  title,
  date,
  onBack,
  onVetPress,
  children,
}: HeaderProps) {
  return (
    <header className="bg-brand-gradient pt-[env(safe-area-inset-top)] pb-10 lg:pb-12">
      <div className="px-5 pt-4 lg:max-w-6xl lg:mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver"
                className="mt-1 w-9 h-9 -ms-2 rounded-full flex items-center justify-center text-white active:bg-white/20 transition-colors shrink-0"
              >
                <ArrowLeft size={20} aria-hidden />
              </button>
            )}
            <div className="min-w-0">
              {date && (
                // 85% de opacidad y 11px como mínimo: por debajo de eso el contraste
                // sobre el extremo claro del degradado baja de 4.5:1.
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/85">
                  {formatLongDate(date)}
                </p>
              )}
              <h1 className="text-[26px] lg:text-[32px] font-extrabold text-white tracking-tight leading-tight mt-1">
                {title}
              </h1>
            </div>
          </div>

          {onVetPress && (
            <button
              type="button"
              onClick={onVetPress}
              aria-label="Veterinarios"
              className="mt-1 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30 transition-colors shrink-0"
            >
              <Stethoscope size={17} aria-hidden />
            </button>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </header>
  );
}
