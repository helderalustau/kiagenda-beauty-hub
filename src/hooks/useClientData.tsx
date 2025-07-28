import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/supabase-entities';

export const useClientData = () => {
  const [loading, setLoading] = useState(false);

  const checkUsernameAvailability = async (username: string, currentClientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_auth')
        .select('id')
        .eq('username', username)
        .neq('id', currentClientId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return { available: true };
      }

      if (error) {
        console.error('Error checking username availability:', error);
        return { available: false, error: 'Erro ao verificar disponibilidade do nome' };
      }

      // Username already exists
      return { available: false, error: 'Este nome de usuário já está em uso' };
    } catch (error) {
      console.error('Error checking username availability:', error);
      return { available: false, error: 'Erro ao verificar disponibilidade do nome' };
    }
  };

  const updateClientProfile = async (clientId: string, profileData: { 
    username: string; 
    full_name?: string;
    email?: string; 
    phone?: string;
    city?: string;
    state?: string;
  }) => {
    try {
      setLoading(true);

      // Verificar se o username já existe para outro cliente
      const usernameCheck = await checkUsernameAvailability(profileData.username, clientId);
      if (!usernameCheck.available) {
        return { success: false, message: usernameCheck.error };
      }

      // Atualizar dados do cliente
      const updateData = {
        username: profileData.username,
        name: profileData.username, // Atualizar o campo name também
        full_name: profileData.full_name || null,
        email: profileData.email || null,
        phone: profileData.phone || null,
        city: profileData.city || null,
        state: profileData.state || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('client_auth')
        .update(updateData)
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client profile:', error);
        return { success: false, message: 'Erro ao atualizar perfil' };
      }

      console.log('Client profile updated successfully:', data);
      return { success: true, client: data };
    } catch (error) {
      console.error('Error updating client profile:', error);
      return { success: false, message: 'Erro ao atualizar perfil' };
    } finally {
      setLoading(false);
    }
  };

  const getClientProfile = async (clientId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Error fetching client profile:', error);
        return { success: false, message: 'Erro ao buscar perfil' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return { success: false, message: 'Erro ao buscar perfil' };
    } finally {
      setLoading(false);
    }
  };

  const clearClientHistory = async (clientId: string) => {
    try {
      setLoading(true);
      
      // Delete all appointments for this client
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('client_auth_id', clientId);

      if (error) {
        console.error('Error clearing client history:', error);
        return { success: false, message: 'Erro ao limpar histórico' };
      }

      return { success: true, message: 'Histórico limpo com sucesso' };
    } catch (error) {
      console.error('Error clearing client history:', error);
      return { success: false, message: 'Erro ao limpar histórico' };
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
    getClientProfile,
    clearClientHistory,
    getClientByPhone,
    getOrCreateClient,
    checkUsernameAvailability
  };
};
