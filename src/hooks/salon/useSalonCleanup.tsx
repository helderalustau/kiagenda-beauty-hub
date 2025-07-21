
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

  const cleanupIncompleteSalons = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_incomplete_salons');

      if (error) {
        console.error('Error cleaning up incomplete salons:', error);
        return { success: false, message: 'Erro ao limpar estabelecimentos incompletos' };
      }

      return { success: true, deletedCount: data };
    } catch (error) {
      console.error('Error cleaning up incomplete salons:', error);
      return { success: false, message: 'Erro ao limpar estabelecimentos incompletos' };
    }
  };

  return {
    cleanupSalonsWithoutAdmins,
    cleanupIncompleteSalons
  };
};
