"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Dashboard } from "@/components/dashboard";
import { Landing } from "@/components/landing";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    setMounted(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Landing />;
}
