
import { supabase } from '@/integrations/supabase/client';

export const useSalonStatus = () => {
  const toggleSalonStatus = async (salonId: string, isOpen: boolean) => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .update({ is_open: isOpen })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling salon status:', error);
        return { success: false, message: 'Erro ao alterar status' };
      }

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error toggling salon status:', error);
      return { success: false, message: 'Erro ao alterar status' };
    }
  };

  return {
    toggleSalonStatus
  };
};
