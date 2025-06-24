
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/supabase-entities';

export const useClientData = () => {
  const [loading, setLoading] = useState(false);

  const updateClientProfile = async (clientId: string, profileData: { username: string; email?: string; phone?: string }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_auth')
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

  const getClientByPhone = async (userId: string) => {
    try {
      setLoading(true);
      
      // Buscar cliente na tabela client_auth usando o ID do usuário
      const { data: clientData, error: clientError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('id', userId)
        .single();

      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error finding client data:', clientError);
        return { success: false, message: 'Erro ao buscar dados do cliente' };
      }

      if (clientData) {
        console.log('getClientByPhone - Client found:', clientData);
        return { success: true, client: clientData };
      }

      return { success: false, message: 'Cliente não encontrado' };
    } catch (error) {
      console.error('Error getting client by phone:', error);
      return { success: false, message: 'Erro ao buscar cliente' };
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateClient = async (clientData: { name: string; phone: string; email?: string }) => {
    try {
      setLoading(true);
      
      // Primeiro, tentar encontrar cliente existente pelo phone na tabela client_auth
      const { data: existingClient, error: findError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('phone', clientData.phone)
        .single();

      if (!findError && existingClient) {
        console.log('getOrCreateClient - Using existing client:', existingClient);
        return { success: true, client: existingClient };
      }

      // Se não encontrou, verificar se é um usuário logado e usar seus dados
      // Não criamos novos registros automaticamente na client_auth
      return { success: false, message: 'Cliente não encontrado' };
    } catch (error) {
      console.error('Error in getOrCreateClient:', error);
      return { success: false, message: 'Erro ao processar dados do cliente' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateClientProfile,
    getClientByPhone,
    getOrCreateClient
  };
};
