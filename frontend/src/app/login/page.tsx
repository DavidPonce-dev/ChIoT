"use client";

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Bienvenido</h1>
          <p className="text-muted-foreground mt-2">
            Inicia sesión para continuar
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <LoginForm onSwitchToRegister={() => router.push("/register")} />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
