import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validations";
import styles from "./login-form.module.css";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const validateForm = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    if (!validateForm()) return;
    
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
          router.push("/dashboard");
        }, 500);
      } else {
        setGeneralError(response.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Iniciar Sesión</h2>
      
      {generalError && (
        <div className={styles.errorAlert}>
          {generalError}
        </div>
      )}

      {success && (
        <div className={styles.successAlert}>
          <CheckCircle className={styles.icon} />
          Login exitoso. Redirigiendo...
        </div>
      )}

      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        error={errors.email}
        disabled={success}
        autoComplete="email"
      />

      <Input
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.password}
        disabled={success}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        disabled={loading || success}
        isLoading={loading}
        className={styles.submitButton}
      >
        {success ? (
          <>
            <CheckCircle className={styles.buttonIcon} />
            Bienvenido
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>

      <p className={styles.switchText}>
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className={styles.switchLink}
          disabled={success}
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}
