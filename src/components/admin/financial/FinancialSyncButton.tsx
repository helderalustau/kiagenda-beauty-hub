import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FinancialSyncButtonProps {
  salonId: string;
  onSyncComplete?: () => void;
}

const FinancialSyncButton = ({ salonId, onSyncComplete }: FinancialSyncButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (!salonId) {
      toast({
        title: "Erro",
        description: "ID do salão não encontrado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Iniciando sincronização financeira para salon:', salonId);
      
      const { data, error } = await supabase.rpc('sync_missing_financial_transactions', {
        p_salon_id: salonId
      });

      if (error) {
        console.error('❌ Erro na sincronização:', error);
        toast({
          title: "Erro na Sincronização",
          description: `Erro: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Sincronização completa:', data);
      
      const result = data as { success: boolean; transactions_created: number; message: string };
      
      if (result?.success) {
        toast({
          title: "✅ Sincronização Completa",
          description: `${result.transactions_created} transações financeiras foram criadas para appointments concluídos`,
          duration: 5000,
        });
        
        // Callback para atualizar dados
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        toast({
          title: "Aviso",
          description: "Nenhuma transação pendente encontrada",
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante a sincronização",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      {isLoading ? 'Sincronizando...' : 'Sincronizar Transações'}
    </Button>
  );
};

export default FinancialSyncButton;