import { categoryStyles } from "../../constants/categories";
import type { EventCategory } from "../../types/events";

interface IconBubbleProps {
  category: EventCategory;
  size?: "sm" | "md";
  className?: string;
}

const sizes = {
  sm: { box: "w-8 h-8", icon: 15 },
  md: { box: "w-10 h-10", icon: 18 },
};

/** Círculo de color con el icono de la categoría. */
function IconBubble({
  category,
  size = "md",
  className = "",
}: IconBubbleProps) {
  const { icon: Icon, fg, soft } = categoryStyles[category];
  const { box, icon } = sizes[size];

  return (
    <div
      className={`${box} ${soft} rounded-full flex items-center justify-center shrink-0 ${className}`}
    >
      <Icon size={icon} className={fg} aria-hidden />
    </div>
  );
}

export default IconBubble;
