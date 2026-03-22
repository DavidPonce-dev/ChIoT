"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await api.auth.register(email, password);
      setSuccess(true);
      setTimeout(async () => {
        const response = await api.auth.login(email, password);
        if (response.success && response.user) {
          setUser(response.user);
          router.push("/");
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          ¡Cuenta creada! Iniciando sesión...
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

      <div>
        <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            Creando cuenta...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Cuenta creada
          </>
        ) : (
          "Crear Cuenta"
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline"
          disabled={success}
        >
          Inicia Sesión
        </button>
      </p>
    </form>
  );
}
