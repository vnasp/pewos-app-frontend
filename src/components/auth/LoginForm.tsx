import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import PasswordStrengthIndicator from "../PasswordStrengthIndicator";
import { useAuth } from "../../context/AuthContext";
import { missingPasswordCriteria } from "../../utils/password";

type Mode = "login" | "register";

const inputClass =
  "w-full bg-canvas border border-line rounded-tile px-4 py-3.5 text-ink text-base outline-none transition-colors focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15 placeholder:text-subtle";

function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "register") {
      const missing = missingPasswordCriteria(password);
      if (missing.length > 0) {
        setError(`A la contraseña le falta: ${missing.join(", ")}.`);
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      // El registro deja la sesión abierta: no hay confirmación por correo.
      if (mode === "register") await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <>
      <div
        role="tablist"
        className="flex bg-canvas rounded-full p-1 mb-6 border border-line"
      >
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2.5 rounded-full text-sm font-extrabold transition-colors ${
              mode === m
                ? "bg-brand-gradient text-white"
                : "text-muted active:text-ink"
            }`}
          >
            {m === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-muted text-xs font-extrabold block mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-muted text-xs font-extrabold block mb-1.5"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={`${inputClass} pe-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle p-1"
            >
              {showPassword ? (
                <EyeOff size={20} aria-hidden />
              ) : (
                <Eye size={20} aria-hidden />
              )}
            </button>
          </div>
          {!isLogin && <PasswordStrengthIndicator password={password} />}
        </div>

        {error && (
          <p
            role="alert"
            className="bg-danger-soft text-danger rounded-tile px-4 py-3 text-sm font-semibold"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-gradient text-white font-extrabold py-4 rounded-full text-base disabled:opacity-60 active:scale-95 transition-transform mt-2 shadow-fab"
        >
          {loading ? "Cargando…" : isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>
    </>
  );
}

export default LoginForm;
