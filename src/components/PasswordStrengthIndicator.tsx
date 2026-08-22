import { Check, X } from "lucide-react";

import { passwordCriteria } from "../utils/password";

/** De rojo a verde. Índice = criterios cumplidos - 1. */
const strengthColors = [
  "bg-danger",
  "bg-danger",
  "bg-care",
  "bg-brand",
  "bg-success",
];

const strengthLabels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte"];

function PasswordStrengthIndicator({
  password,
}: {
  password: string;
}) {
  if (!password) return null;

  const passed = passwordCriteria.filter((c) => c.regex.test(password)).length;
  const color = strengthColors[Math.min(passed - 1, 4)] ?? "bg-line";
  const label = strengthLabels[Math.min(passed - 1, 4)] ?? "";

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${(passed / passwordCriteria.length) * 100}%` }}
          />
        </div>
        <span className="text-muted text-xs font-bold w-16 text-right">
          {label}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {passwordCriteria.map(({ id, regex, text }) => {
          const ok = regex.test(password);
          return (
            <li
              key={id}
              className={`flex items-center gap-1 text-xs font-semibold ${
                ok ? "text-success" : "text-subtle"
              }`}
            >
              {ok ? (
                <Check size={12} aria-hidden />
              ) : (
                <X size={12} aria-hidden />
              )}
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PasswordStrengthIndicator;
