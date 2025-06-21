
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';

export const useSalonSetupCompletion = () => {
  const [loading, setLoading] = useState(false);

  const completeSalonSetup = async (salonId: string, setupData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('salons')
        .update({
          ...setupData,
          setup_completed: true,
          is_open: true
        })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error completing salon setup:', error);
        return { success: false, message: 'Erro ao finalizar configuração' };
      }

      return { success: true, salon: data as Salon };
    } catch (error) {
      console.error('Error completing salon setup:', error);
      return { success: false, message: 'Erro ao finalizar configuração' };
    } finally {
      setLoading(false);
    }
  };

  return {
    completeSalonSetup,
    loading
  };
};
