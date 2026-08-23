import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import "./App.css";
import AppLayout from "./components/AppLayout";
import Spinner from "./components/ui/Spinner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { usePwaUpdate } from "./hooks/usePwaUpdate";
import AuthScreen from "./screens/AuthScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // La app es de uso personal y los datos cambian poco: se evita refetch al enfocar
      // la ventana, que en una PWA de móvil ocurre constantemente.
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: 1,
    },
  },
});

/**
 * El onboarding se muestra una sola vez por navegador.
 *
 * Antes arrancaba siempre en `true` y no se guardaba nada, así que aparecía en cada
 * apertura de la app. El acceso va en try/catch porque en modo privado o con las cookies
 * bloqueadas `localStorage` lanza en vez de devolver null.
 */
const ONBOARDING_KEY = "pewos.onboarding.seen";

function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

function AppContent() {
  const { user, loading } = useAuth();
  const [seenOnboarding, setSeenOnboarding] = useState(hasSeenOnboarding);
  usePwaUpdate();

  const dismissOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // Sin persistencia se volverá a mostrar; no es motivo para romper el flujo.
    }
    setSeenOnboarding(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-svh bg-brand-gradient">
        <Spinner tone="light" size="lg" />
      </div>
    );
  }

  if (user) {
    return <AppLayout />;
  }

  // Quien ya vio la intro entra con el drawer arriba y no tiene que tocar nada.
  return <AuthScreen startOpen={seenOnboarding} onOpen={dismissOnboarding} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
