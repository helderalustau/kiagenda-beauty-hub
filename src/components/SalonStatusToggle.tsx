
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Store, LockOpen, Lock } from "lucide-react";
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
        <Badge 
          variant={isOpen ? "default" : "secondary"} 
          className={`flex items-center space-x-1 cursor-pointer transition-colors ${
            isOpen 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          onClick={handleToggleStatus}
        >
          {isOpen ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          <span>{isOpen ? 'Aberta' : 'Fechada'}</span>
        </Badge>
      </div>
    </div>
  );
};

export default SalonStatusToggle;
