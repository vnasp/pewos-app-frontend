import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import "./App.css";
import AppLayout from "./components/AppLayout";
import Spinner from "./components/ui/Spinner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { usePwaUpdate } from "./hooks/usePwaUpdate";
import LoginScreen from "./screens/LoginScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

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

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  usePwaUpdate();

  if (showOnboarding) {
    return <OnboardingScreen onContinue={() => setShowOnboarding(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-svh bg-brand-gradient">
        <Spinner tone="light" size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppLayout />;
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
