import React, { memo, useState, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Store, LockOpen, Lock } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { useToast } from "@/hooks/use-toast";

interface OptimizedSalonStatusToggleProps {
  salonId: string;
  isOpen: boolean | null;
  onStatusChange?: (isOpen: boolean) => void;
}

const OptimizedSalonStatusToggle = memo(({ salonId, isOpen, onStatusChange }: OptimizedSalonStatusToggleProps) => {
  const { toggleSalonStatus } = useSalonData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = useCallback(async () => {
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
  }, [loading, isOpen, salonId, toggleSalonStatus, toast, onStatusChange]);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Store className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge 
          variant="outline"
          className={`flex items-center space-x-1 transition-all duration-300 cursor-pointer border-2 ${
            loading 
              ? 'opacity-70 cursor-wait'
              : isOpen 
                ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900' 
                : 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900'
          }`}
          onClick={handleToggleStatus}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          ) : isOpen ? (
            <LockOpen className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          <span>
            {loading ? 'Alterando...' : isOpen ? 'Aberta' : 'Fechada'}
          </span>
        </Badge>
      </div>
    </div>
  );
});

OptimizedSalonStatusToggle.displayName = 'OptimizedSalonStatusToggle';

export default OptimizedSalonStatusToggle;