import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useServiceCRUD } from './services/useServiceCRUD';

export const useServiceToggle = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { updateService } = useServiceCRUD();

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    setLoading(true);
    
    try {
      const newStatus = !currentStatus;
      
      const result = await updateService(serviceId, { active: newStatus });
      
      if (result.success) {
        toast({
          title: "Status Atualizado",
          description: `Serviço marcado como ${newStatus ? 'ativo' : 'desabilitado'}`,
        });
        return { success: true, newStatus };
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao alterar status do serviço",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao alterar status do serviço",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    toggleServiceStatus
  };
};