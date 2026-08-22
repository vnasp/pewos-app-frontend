interface Person {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

/**
 * Cómo se llama a alguien en la interfaz.
 *
 * El correo es el respaldo porque siempre existe: el nombre es opcional y el registro no
 * lo pide, así que hay cuentas que solo tienen eso.
 *
 * El "marcado por" no pasa por aquí: la API ya manda solo el nombre de pila en
 * `completed_by_name`, resuelto en la misma consulta que trae las completions.
 */
export function fullName(person: Person): string {
  const name = [person.first_name, person.last_name].filter(Boolean).join(" ");
  return name || person.email;
}

/** La inicial del avatar, del nombre si lo hay y del correo si no. */
export function initial(person: Person): string {
  return fullName(person).charAt(0).toUpperCase();
}
