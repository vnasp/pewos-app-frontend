import type { ReactNode } from "react";

import ScreenHeader from "./ScreenHeader";

interface FormScreenProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

/**
 * El armazón de los formularios de alta y edición.
 *
 * El ancho máximo es el mismo en los seis: antes unos eran `2xl` y otros `3xl`, y en
 * escritorio se notaba al pasar de uno a otro. Un formulario de una columna tampoco gana
 * nada estirándose más.
 */
function FormScreen({ title, onBack, children }: FormScreenProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      <div className="px-5 pt-5 flex flex-col gap-4 lg:max-w-2xl lg:mx-auto lg:w-full">
        <ScreenHeader title={title} onBack={onBack} />
        {children}
      </div>
    </div>
  );
}

export default FormScreen;
