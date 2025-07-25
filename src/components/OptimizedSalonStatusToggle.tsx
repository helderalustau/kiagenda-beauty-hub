import React, { memo, useState, useCallback, useEffect } from 'react';
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
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);

  // Sincronizar estado local quando props mudam
  useEffect(() => {
    setLocalIsOpen(isOpen);
  }, [isOpen]);

  const handleToggleStatus = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    const newStatus = !localIsOpen;
    
    // Atualização otimista: muda visual imediatamente
    setLocalIsOpen(newStatus);
    onStatusChange?.(newStatus);
    
    try {
      const result = await toggleSalonStatus(salonId, newStatus);
      
      if (result.success) {
        toast({
          title: "Status Atualizado",
          description: `Loja marcada como ${newStatus ? 'aberta' : 'fechada'}`,
        });
      } else {
        // Reverter em caso de erro
        setLocalIsOpen(!newStatus);
        onStatusChange?.(!newStatus);
        toast({
          title: "Erro",
          description: result.message || "Erro ao alterar status",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Reverter em caso de erro
      setLocalIsOpen(!newStatus);
      onStatusChange?.(!newStatus);
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao alterar status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [loading, localIsOpen, salonId, toggleSalonStatus, toast, onStatusChange]);

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
            ${localIsOpen 
              ? 'bg-success/10 border-success text-success hover:bg-success/20 hover:border-success/80' 
              : 'bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20 hover:border-destructive/80'
            }
          `}
          onClick={handleToggleStatus}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          ) : (
            <div className="transition-transform duration-200">
              {localIsOpen ? (
                <LockOpen className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
            </div>
          )}
          <span className="font-medium">
            {loading ? 'Alterando...' : localIsOpen ? 'Aberta' : 'Fechada'}
          </span>
        </Badge>
      </div>
    </div>
  );
});

OptimizedSalonStatusToggle.displayName = 'OptimizedSalonStatusToggle';

export default OptimizedSalonStatusToggle;