import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentFinancialSync = () => {
  const { toast } = useToast();

  const processAppointmentCompletion = async (appointmentId: string) => {
    try {
      console.log('💰 Processando conclusão financeira do appointment:', appointmentId);

      const { data, error } = await supabase.functions.invoke('process-appointment-completion', {
        body: { appointmentId }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      console.log('✅ Resposta da edge function:', data);

      if (data.success) {
        toast({
          title: "Receita registrada",
          description: `Receita de ${data.transaction.amount ? `R$ ${data.transaction.amount.toFixed(2)}` : 'valor processado'} registrada no financeiro`,
        });

        return { success: true, data };
      } else {
        console.error('❌ Edge function retornou erro:', data);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Erro ao processar conclusão financeira:', error);
      
      toast({
        title: "Erro financeiro",
        description: "Erro ao registrar receita no sistema financeiro",
        variant: "destructive"
      });

      return { success: false, error };
    }
  };

  return {
    processAppointmentCompletion
  };
};