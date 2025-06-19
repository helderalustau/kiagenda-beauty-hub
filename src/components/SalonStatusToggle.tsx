
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Clock } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface SalonStatusToggleProps {
  salonId: string;
  isOpen: boolean | null;
  onStatusChange?: (isOpen: boolean) => void;
}

const SalonStatusToggle = ({ salonId, isOpen, onStatusChange }: SalonStatusToggleProps) => {
  const { toggleSalonStatus } = useSupabaseData();
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    const newStatus = !isOpen;
    const result = await toggleSalonStatus(salonId, newStatus);
    
    if (result.success) {
      toast({
        title: "Status Atualizado",
        description: `Estabelecimento marcado como ${newStatus ? 'aberto' : 'fechado'}`,
      });
      onStatusChange?.(newStatus);
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
          <Clock className="h-3 w-3" />
          <span>{isOpen ? 'Aberto' : 'Fechado'}</span>
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
            <Clock className="h-4 w-4" />
            <span>Fechar Estabelecimento</span>
          </>
        ) : (
          <>
            <Store className="h-4 w-4" />
            <span>Abrir Estabelecimento</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SalonStatusToggle;
