
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClientManagement = () => {
  // Buscar ou criar cliente
  const findOrCreateClient = useCallback(async (name: string, phone: string) => {
    try {
      console.log('🔍 Finding or creating client:', { name, phone });
      
      // Primeiro, tentar encontrar cliente existente pelo telefone
      const { data: existingClient, error: searchError } = await supabase
        .from('client_auth')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Error searching client:', searchError);
        throw searchError;
      }

      if (existingClient) {
        console.log('✅ Found existing client:', existingClient.id);
        return existingClient.id;
      }

      // Se não existe, criar novo cliente
      console.log('➕ Creating new client');
      const { data: newClient, error: createError } = await supabase
        .from('client_auth')
        .insert({
          username: name.trim(),
          name: name.trim(),
          phone: phone.trim(),
          password: 'temp_password_' + Date.now(), // Temporary password
          email: null
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating client:', createError);
        throw createError;
      }

      console.log('✅ New client created:', newClient.id);
      return newClient.id;
    } catch (error) {
      console.error('❌ Error in findOrCreateClient:', error);
      throw error;
    }
  }, []);

  return {
    findOrCreateClient
  };
};
