
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from './useSupabaseData';

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

  // Corrigido para buscar por telefone ou nome
  const getClientByPhone = async (phoneOrName: string) => {
    try {
      setLoading(true);
      
      // Primeiro tenta buscar por telefone
      let { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phoneOrName)
        .single();

      // Se não encontrou por telefone, tenta buscar por nome
      if (error && error.code === 'PGRST116') {
        const { data: nameData, error: nameError } = await supabase
          .from('clients')
          .select('*')
          .eq('name', phoneOrName)
          .single();
        
        data = nameData;
        error = nameError;
      }

      if (error && error.code === 'PGRST116') {
        return { success: false, message: 'Cliente não encontrado' };
      }
      
      if (error) {
        console.error('Error fetching client:', error);
        return { success: false, message: 'Erro ao buscar cliente' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error fetching client:', error);
      return { success: false, message: 'Erro ao buscar cliente' };
    } finally {
      setLoading(false);
    }
  };

  // Nova função para buscar ou criar cliente
  const getOrCreateClient = async (clientData: { name: string; phone: string; email?: string }) => {
    try {
      setLoading(true);
      
      // Primeiro tenta buscar cliente existente
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', clientData.phone)
        .single();

      if (!searchError && existingClient) {
        return { success: true, client: existingClient };
      }

      // Se não encontrou, cria novo cliente
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email || null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        return { success: false, message: 'Erro ao criar cliente' };
      }

      return { success: true, client: newClient };
    } catch (error) {
      console.error('Error getting or creating client:', error);
      return { success: false, message: 'Erro ao processar cliente' };
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
