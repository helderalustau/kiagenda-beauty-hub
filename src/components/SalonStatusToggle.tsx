
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Clock, LockOpen, Lock } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { useToast } from "@/components/ui/use-toast";

interface SalonStatusToggleProps {
  salonId: string;
  isOpen: boolean | null;
  onStatusChange?: (isOpen: boolean) => void;
}

const SalonStatusToggle = ({ salonId, isOpen, onStatusChange }: SalonStatusToggleProps) => {
  const { toggleSalonStatus } = useSalonData();
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    const newStatus = !isOpen;
    const result = await toggleSalonStatus(salonId, newStatus);
    
    if (result.success) {
      toast({
        title: "Status Atualizado",
        description: `Loja marcada como ${newStatus ? 'aberta' : 'fechada'}`,
      });
      onStatusChange?.(newStatus);
      // Não fazer refresh da página - remover qualquer window.location.reload()
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Store className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-600">Status:</span>
        <Badge variant={isOpen ? "default" : "secondary"} className="flex items-center space-x-1">
          {isOpen ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          <span>{isOpen ? 'Aberta' : 'Fechada'}</span>
        </Badge>
      </div>
      
      <Button
        variant={isOpen ? "destructive" : "default"}
        size="sm"
        onClick={handleToggleStatus}
        className="flex items-center space-x-2"
      >
        {isOpen ? (
          <>
            <Lock className="h-4 w-4" />
            <span>Fechar Loja</span>
          </>
        ) : (
          <>
            <LockOpen className="h-4 w-4" />
            <span>Abrir Loja</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SalonStatusToggle;
