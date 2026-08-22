import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Verde para "todo completado", neutro para "no hay nada". */
  tone?: "neutral" | "success";
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "neutral",
}: EmptyStateProps) {
  const color = tone === "success" ? "text-success" : "text-subtle";

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <Icon size={52} strokeWidth={1.5} className={color} aria-hidden />
      <p className={`mt-4 text-sm font-bold ${color}`}>{title}</p>
      {description && (
        <p className="mt-1 text-sm text-subtle max-w-xs">{description}</p>
      )}
    </div>
  );
}
