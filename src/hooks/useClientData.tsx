
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from './useSupabaseData';

export const useClientData = () => {
  const [loading, setLoading] = useState(false);

  const updateClientProfile = async (clientId: string, profileData: { name: string; email?: string; phone: string }) => {
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
      setLoading(true);
      
      // Primeiro, tentar buscar na tabela client_auth
      const { data: authData, error: authError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', phone)
        .single();

      if (authError && authError.code !== 'PGRST116') {
        console.error('Error finding client auth:', authError);
        return { success: false, message: 'Erro ao buscar dados do cliente' };
      }

      if (authData) {
        // Buscar dados completos na tabela clients usando o phone
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', authData.phone || authData.name)
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          console.error('Error finding client data:', clientError);
        }

        // Se não encontrou na tabela clients, criar um registro baseado nos dados de auth
        if (!clientData) {
          const newClientData = {
            name: authData.name,
            phone: authData.phone || authData.name,
            email: authData.email || null
          };

          const { data: createdClient, error: createError } = await supabase
            .from('clients')
            .insert(newClientData)
            .select()
            .single();

          if (createError) {
            console.error('Error creating client:', createError);
            return { success: false, message: 'Erro ao criar dados do cliente' };
          }

          return { success: true, client: createdClient };
        }

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
      
      // Primeiro, tentar encontrar cliente existente
      const { data: existingClient, error: findError } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', clientData.phone)
        .single();

      if (!findError && existingClient) {
        return { success: true, client: existingClient };
      }

      // Se não encontrou, criar novo cliente
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
