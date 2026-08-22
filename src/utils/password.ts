/**
 * Criterios de contraseña.
 *
 * Viven fuera del componente para que `PasswordStrengthIndicator` exporte solo el
 * componente: mezclar ambos rompe el fast refresh de Vite (regla
 * `react-refresh/only-export-components`).
 */
export const passwordCriteria = [
  { id: "length", regex: /^.{8,}$/, text: "Mín. 8 caracteres" },
  { id: "upper", regex: /[A-Z]/, text: "Mayúscula" },
  { id: "lower", regex: /[a-z]/, text: "Minúscula" },
  { id: "number", regex: /\d/, text: "Número" },
  { id: "special", regex: /[\W_]/, text: "Símbolo especial" },
] as const;

/** True si la contraseña cumple todos los criterios. */
export function isPasswordStrong(password: string): boolean {
  return passwordCriteria.every((c) => c.regex.test(password));
}
