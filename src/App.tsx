import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { RouterProvider } from "react-router";

import "./App.css";
import Spinner from "./components/ui/Spinner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthScreen from "./pages/auth/AuthScreen";
import { router } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 15_000,
      retry: 1,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const [introSeen, setIntroSeen] = useState(false);

  const markIntroSeen = useCallback(() => setIntroSeen(true), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-svh bg-brand-gradient">
        <Spinner tone="light" size="lg" />
      </div>
    );
  }

  if (user && introSeen) {
    return <RouterProvider router={router} />;
  }

  // Con sesión activa la portada solo pide un toque: el botón dice "Continuar".
  return <AuthScreen onIntroSeen={markIntroSeen} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
