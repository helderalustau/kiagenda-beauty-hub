
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClientData = () => {
  const [loading, setLoading] = useState(false);

  const updateClientProfile = async (clientId: string, profileData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .update(profileData)
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client profile:', error);
        return { success: false, message: 'Erro ao atualizar perfil' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error updating client profile:', error);
      return { success: false, message: 'Erro ao atualizar perfil' };
    } finally {
      setLoading(false);
    }
  };

  const getClientByPhone = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        return { success: false, message: 'Cliente não encontrado' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error fetching client:', error);
      return { success: false, message: 'Erro ao buscar cliente' };
    }
  };

  return {
    loading,
    updateClientProfile,
    getClientByPhone
  };
};
