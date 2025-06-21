
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminManagement = () => {
  const [loading, setLoading] = useState(false);

  const updateAdminUser = async (adminData: any) => {
    try {
      setLoading(true);
      
      const updatedData = {
        ...adminData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('admin_auth')
        .update(updatedData)
        .eq('id', adminData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating admin user:', error);
        return { success: false, message: 'Erro ao atualizar usuário' };
      }

      return { success: true, admin: data };
    } catch (error) {
      console.error('Error updating admin user:', error);
      return { success: false, message: 'Erro ao atualizar usuário' };
    } finally {
      setLoading(false);
    }
  };

  const deleteAdminUser = async (adminId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('admin_auth')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('Error deleting admin user:', error);
        return { success: false, message: 'Erro ao excluir usuário' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return { success: false, message: 'Erro ao excluir usuário' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateAdminUser,
    deleteAdminUser
  };
};
