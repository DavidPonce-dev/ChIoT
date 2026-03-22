import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validations";
import styles from "./register-form.module.css";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const validateForm = () => {
    const result = registerSchema.safeParse({ email, password, confirmPassword });
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
      await api.auth.register(email, password);
      setSuccess(true);
      
      setTimeout(async () => {
        try {
          const response = await api.auth.login(email, password);
          if (response.success && response.user) {
            setUser(response.user);
            router.push("/dashboard");
          }
        } catch {
          setGeneralError("Error al iniciar sesión automáticamente");
          setSuccess(false);
        }
      }, 1500);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Error al registrar");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Crear Cuenta</h2>
      
      {generalError && (
        <div className={styles.errorAlert}>
          {generalError}
        </div>
      )}

      {success && (
        <div className={styles.successAlert}>
          <CheckCircle className={styles.icon} />
          ¡Cuenta creada! Iniciando sesión...
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

      <div className={styles.passwordRequirements}>
        <p className={styles.requirementsTitle}>La contraseña debe:</p>
        <ul className={styles.requirementsList}>
          <li className={password.length >= 8 ? styles.valid : ""}>Al menos 8 caracteres</li>
          <li className={/[A-Z]/.test(password) ? styles.valid : ""}>Una mayúscula</li>
          <li className={/[a-z]/.test(password) ? styles.valid : ""}>Una minúscula</li>
          <li className={/[0-9]/.test(password) ? styles.valid : ""}>Un número</li>
          <li className={/[^A-Za-z0-9]/.test(password) ? styles.valid : ""}>Un carácter especial</li>
        </ul>
      </div>

      <Input
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.password}
        disabled={success}
        autoComplete="new-password"
      />

      <Input
        type="password"
        label="Confirmar Contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.confirmPassword}
        disabled={success}
        autoComplete="new-password"
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
            Cuenta creada
          </>
        ) : (
          "Crear Cuenta"
        )}
      </Button>

      <p className={styles.switchText}>
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className={styles.switchLink}
          disabled={success}
        >
          Inicia Sesión
        </button>
      </p>
    </form>
  );
}
