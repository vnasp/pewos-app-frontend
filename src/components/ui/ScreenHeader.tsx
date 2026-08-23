import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface ScreenHeaderProps {
  title: string;
  /** Con `onBack` aparece la flecha; sin ella el título va solo. */
  onBack?: () => void;
  /** Acción a la derecha, alineada al extremo. */
  action?: ReactNode;
  className?: string;
}

function ScreenHeader({ title, onBack, action, className = "" }: ScreenHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="w-9 h-9 bg-canvas rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeft size={18} className="text-ink" aria-hidden />
        </button>
      )}
      <h2 className="text-ink font-extrabold text-lg flex-1 min-w-0 truncate">{title}</h2>
      {action}
    </div>
  );
}

export default ScreenHeader;
