"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Dashboard } from "@/components/dashboard";
import { Landing } from "@/components/landing";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <Landing />;
}
