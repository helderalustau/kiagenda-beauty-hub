
import React from 'react';
import { Button } from "@/components/ui/button";

interface AdminFormActionsProps {
  onCancel?: () => void;
  submitting: boolean;
  loading: boolean;
}

const AdminFormActions = ({ onCancel, submitting, loading }: AdminFormActionsProps) => {
  return (
    <div className="flex gap-4 pt-6">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 border-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </Button>
      )}
      <Button
        type="submit"
        disabled={submitting || loading}
        className="flex-1 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white font-medium py-3"
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Criando Conta...
          </div>
        ) : (
          "Criar Conta Administrativa"
        )}
      </Button>
    </div>
  );
};

export default AdminFormActions;
