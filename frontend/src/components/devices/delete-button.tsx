"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toaster";
import { useDeleteDevice } from "@/hooks/use-devices";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteButtonProps {
  uuid: string;
  type: string;
  deviceName: string;
  onDeleted?: () => void;
}

export function DeleteButton({ uuid, type, deviceName, onDeleted }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const deleteMutation = useDeleteDevice();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ uuid, type });
      toast("success", `${deviceName} eliminado`);
      onDeleted?.();
    } catch {
      toast("error", "Error al eliminar dispositivo");
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={deleteMutation.isPending}
        className="p-2 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
      >
        {deleteMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Eliminar dispositivo"
        message={`¿Estás seguro de eliminar "${deviceName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
