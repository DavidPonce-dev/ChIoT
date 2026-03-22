"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: { id: string; email: string };
}

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await api.auth.login(email, password);
      
      if (response.success) {
        setSuccess(true);
        if (response.user) {
          setUser(response.user);
        }
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setError(response.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Login exitoso. Redirigiendo...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          placeholder="tu@email.com"
          required
          disabled={success}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          placeholder="••••••••"
          required
          disabled={success}
        />
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Bienvenido
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary hover:underline"
          disabled={success}
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}
