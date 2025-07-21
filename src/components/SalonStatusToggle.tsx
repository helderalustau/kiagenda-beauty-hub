
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Store, LockOpen, Lock } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { useToast } from "@/hooks/use-toast";

interface SalonStatusToggleProps {
  salonId: string;
  isOpen: boolean | null;
  onStatusChange?: (isOpen: boolean) => void;
}

const SalonStatusToggle = ({ salonId, isOpen, onStatusChange }: SalonStatusToggleProps) => {
  const { toggleSalonStatus } = useSalonData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const newStatus = !isOpen;
      
      const result = await toggleSalonStatus(salonId, newStatus);
      
      if (result.success) {
        toast({
          title: "Status Atualizado",
          description: `Loja marcada como ${newStatus ? 'aberta' : 'fechada'}`,
        });
        
        // Callback para atualizar o estado no componente pai
        onStatusChange?.(newStatus);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao alterar status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao alterar status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Store className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge 
          variant="outline"
          className={`
            flex items-center space-x-1 cursor-pointer border-2 
            transition-all duration-300 ease-in-out transform
            ${loading 
              ? 'opacity-70 cursor-wait scale-95' 
              : 'hover:scale-105 active:scale-95'
            }
            ${isOpen 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-600 dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-900' 
              : 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100 hover:border-red-600 dark:bg-red-950 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900'
            }
          `}
          onClick={handleToggleStatus}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          ) : (
            <div className="transition-transform duration-200">
              {isOpen ? (
                <LockOpen className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
            </div>
          )}
          <span className="font-medium">
            {loading ? 'Alterando...' : isOpen ? 'Aberta' : 'Fechada'}
          </span>
        </Badge>
      </div>
    </div>
  );
};

export default SalonStatusToggle;
