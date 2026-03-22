"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { User, Mail, Lock, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return api.auth.changePassword(data);
    },
    onSuccess: () => {
      toast("success", "Contraseña cambiada correctamente");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    },
    onError: (error: Error) => {
      toast("error", error.message || "Error al cambiar contraseña");
    },
  });

  const validatePasswordChange = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswordChange()) {
      changePasswordMutation.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Mi Perfil</h1>

        <div className="space-y-6">
          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg transition-all"
                    disabled
                  />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  El correo no puede ser cambiado
                </p>
              </div>

              <div className="pt-2">
                <p className="text-sm text-[var(--muted-foreground)]">
                  ID de usuario: <span className="font-mono">{user?.id || "N/A"}</span>
                </p>
              </div>
            </div>
          </section>

          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Cambiar Contraseña
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña actual</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className={`w-full px-4 py-2 bg-[var(--secondary)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all ${
                    errors.currentPassword ? "border-red-500" : "border-[var(--border)]"
                  }`}
                  placeholder="••••••••"
                />
                {errors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className={`w-full px-4 py-2 bg-[var(--secondary)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all ${
                    errors.newPassword ? "border-red-500" : "border-[var(--border)]"
                  }`}
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 bg-[var(--secondary)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all ${
                    errors.confirmPassword ? "border-red-500" : "border-[var(--border)]"
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Sesiones Activas
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Esta función estará disponible pronto. Podrás ver y gestionar tus sesiones activas desde aquí.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
