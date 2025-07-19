import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, RefreshCw } from "lucide-react";

interface ManualNotificationCheckerProps {
  pendingCount: number;
  isChecking: boolean;
  onCheck: () => void;
}

const ManualNotificationChecker: React.FC<ManualNotificationCheckerProps> = ({
  pendingCount,
  isChecking,
  onCheck
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Badge com contagem de pendentes */}
      {pendingCount > 0 && (
        <Badge variant="destructive" className="animate-pulse">
          <Bell className="h-3 w-3 mr-1" />
          {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
        </Badge>
      )}
      
      {/* Botão de verificação manual */}
      <Button
        onClick={onCheck}
        disabled={isChecking}
        variant="outline"
        size="sm"
        className="relative"
      >
        <RefreshCw 
          className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} 
        />
        {isChecking ? 'Verificando...' : 'Verificar Agendamentos'}
      </Button>
    </div>
  );
};

export default ManualNotificationChecker;