
import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Store, LockOpen, Lock, AlertTriangle } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { useToast } from "@/hooks/use-toast";
import { usePlanLimitsChecker } from '@/hooks/usePlanLimitsChecker';

interface SalonStatusToggleProps {
  salonId: string;
  isOpen: boolean | null;
  onStatusChange?: (isOpen: boolean) => void;
}

const SalonStatusToggle = ({ salonId, isOpen, onStatusChange }: SalonStatusToggleProps) => {
  const { toggleSalonStatus } = useSalonData();
  const { toast } = useToast();
  const { getSalonAppointmentStats } = usePlanLimitsChecker();
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentStats, setAppointmentStats] = useState<any>(null);

  // Verificar limites quando o salonId mudar
  useEffect(() => {
    const checkLimits = async () => {
      if (!salonId) return;
      
      try {
        const stats = await getSalonAppointmentStats(salonId);
        if (stats.success) {
          setIsLimitReached(stats.limitReached);
          setAppointmentStats(stats);
        }
      } catch (error) {
        console.error('Erro ao verificar limites:', error);
      }
    };

    checkLimits();
  }, [salonId, getSalonAppointmentStats]);

  const handleToggleStatus = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const newStatus = !isOpen;
      console.log('🔄 Alterando status da loja:', { salonId, from: isOpen, to: newStatus });
      
      // REMOVIDO: Verificação que impedia abrir quando limite atingido
      // Agora o admin pode sempre abrir/fechar a loja manualmente
      
      const result = await toggleSalonStatus(salonId, newStatus);
      
      if (result.success) {
        console.log('✅ Status alterado com sucesso:', result);
        
        // Feedback de sucesso
        toast({
          title: "Status Atualizado",
          description: `Loja marcada como ${newStatus ? 'aberta' : 'fechada'}`,
        });
        
        // Callback para atualizar o estado no componente pai
        onStatusChange?.(newStatus);
        
        // Atualizar stats após mudança de status
        const updatedStats = await getSalonAppointmentStats(salonId);
        if (updatedStats.success) {
          setIsLimitReached(updatedStats.limitReached);
          setAppointmentStats(updatedStats);
        }
      } else {
        console.error('❌ Erro ao alterar status:', result);
        toast({
          title: "Erro",
          description: result.message || "Erro ao alterar status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao alterar status:', error);
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
        <Store className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-600">Status:</span>
        <Badge 
          variant={isOpen ? "default" : "secondary"} 
          className={`flex items-center space-x-1 transition-colors cursor-pointer ${
            loading 
              ? 'opacity-70 cursor-wait'
              : isOpen 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          onClick={handleToggleStatus}
        >
          {isOpen ? (
            <LockOpen className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          <span>
            {isOpen ? 'Aberta' : 'Fechada'}
          </span>
        </Badge>
        
        {/* Aviso de limite atingido - apenas informativo */}
        {isLimitReached && (
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-orange-600 font-medium">
              Limite atingido ({appointmentStats?.currentAppointments}/{appointmentStats?.maxAppointments})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonStatusToggle;
