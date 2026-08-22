import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Atenúa la tarjeta, para recordatorios ya completados. */
  dimmed?: boolean;
  className?: string;
}

export default function Card({
  children,
  dimmed = false,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-white border border-line rounded-card shadow-card transition-opacity ${
        dimmed ? "opacity-55" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
