
import React from 'react';
import { Button } from "@/components/ui/button";

interface AdminFormActionsProps {
  onCancel: () => void;
  submitting: boolean;
  loading: boolean;
}

const AdminFormActions = ({
  onCancel,
  submitting,
  loading
}: AdminFormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={submitting}
        className="flex-1"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={submitting || loading}
        className="flex-1 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
      >
        {submitting ? "Criando..." : "Criar Administrador"}
      </Button>
    </div>
  );
};

export default AdminFormActions;
