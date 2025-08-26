import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSalonFinancialOperations = () => {
  const [loading, setLoading] = useState(false);

  const clearSalonFinancialData = async (salonId: string): Promise<{success: boolean, message?: string, deleted_transactions?: number}> => {
    setLoading(true);
    try {
      console.log('Iniciando limpeza de dados financeiros para o salão:', salonId);
      
      const { data, error } = await supabase.rpc('clear_salon_financial_data', {
        p_salon_id: salonId
      });

      if (error) {
        console.error('Erro ao limpar dados financeiros:', error);
        return { 
          success: false, 
          message: 'Erro ao limpar dados financeiros: ' + error.message 
        };
      }

      console.log('Resultado da limpeza:', data);
      
      // Parse the data as it comes as JSON from the function
      if (data && typeof data === 'object') {
        return data as {success: boolean, message?: string, deleted_transactions?: number};
      }
      
      return { 
        success: true, 
        message: 'Dados financeiros limpos com sucesso!' 
      };
    } catch (error) {
      console.error('Erro inesperado ao limpar dados financeiros:', error);
      return { 
        success: false, 
        message: 'Erro inesperado ao limpar dados financeiros' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    clearSalonFinancialData
  };
};