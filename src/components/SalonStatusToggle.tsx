
import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Store, LockOpen, Lock, AlertTriangle } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { useToast } from "@/components/ui/use-toast";
import { usePlanLimitsChecker } from '@/hooks/usePlanLimitsChecker';

interface SalonStatusToggleProps {
  salonId: string;
  isOpen: boolean | null;
  onStatusChange?: (isOpen: boolean) => void;
}

const SalonStatusToggle = ({ salonId, isOpen, onStatusChange }: SalonStatusToggleProps) => {
  const { toggleSalonStatus } = useSalonData();
  const { toast } = useToast();
  const { checkAndEnforcePlanLimits, getSalonAppointmentStats } = usePlanLimitsChecker();
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar limites ao montar o componente e quando o salonId mudar
  useEffect(() => {
    const checkLimits = async () => {
      const stats = await getSalonAppointmentStats(salonId);
      if (stats.success) {
        setIsLimitReached(stats.limitReached);
        
        // Se o limite foi atingido, forçar fechamento
        if (stats.limitReached && isOpen) {
          await checkAndEnforcePlanLimits(salonId);
          onStatusChange?.(false);
        }
      }
    };

    if (salonId) {
      checkLimits();
    }
  }, [salonId, isOpen, getSalonAppointmentStats, checkAndEnforcePlanLimits, onStatusChange]);

  const handleToggleStatus = async () => {
    setLoading(true);
    
    // Se está tentando abrir, verificar limites primeiro
    if (!isOpen) {
      const stats = await getSalonAppointmentStats(salonId);
      if (stats.success && stats.limitReached) {
        toast({
          title: "Limite Atingido",
          description: "Você atingiu o limite do seu plano. Faça upgrade para reabrir a loja.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
    }

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
    
    setLoading(false);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Store className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-600">Status:</span>
        <Badge 
          variant={isOpen ? "default" : "secondary"} 
          className={`flex items-center space-x-1 transition-colors ${
            isLimitReached 
              ? 'bg-orange-500 text-white cursor-not-allowed' 
              : loading 
                ? 'cursor-wait opacity-70'
                : `cursor-pointer ${
                    isOpen 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`
          }`}
          onClick={isLimitReached ? undefined : handleToggleStatus}
          title={isLimitReached ? "Limite do plano atingido. Faça upgrade para reabrir." : undefined}
        >
          {isLimitReached ? (
            <AlertTriangle className="h-3 w-3" />
          ) : isOpen ? (
            <LockOpen className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          <span>
            {isLimitReached ? 'Limite Atingido' : isOpen ? 'Aberta' : 'Fechada'}
          </span>
        </Badge>
        {isLimitReached && (
          <span className="text-xs text-orange-600 font-medium">
            Upgrade necessário
          </span>
        )}
      </div>
    </div>
  );
};

export default SalonStatusToggle;
