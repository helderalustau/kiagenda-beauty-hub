
import { supabase } from '@/integrations/supabase/client';

export const useSalonCleanup = () => {
  const cleanupSalonsWithoutAdmins = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_salons_without_admins');

      if (error) {
        console.error('Error cleaning up salons:', error);
        return { success: false, message: 'Erro ao limpar estabelecimentos' };
      }

      return { success: true, deletedCount: data };
    } catch (error) {
      console.error('Error cleaning up salons:', error);
      return { success: false, message: 'Erro ao limpar estabelecimentos' };
    }
  };

  return {
    cleanupSalonsWithoutAdmins
  };
};
