
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClientAuth = () => {
  const [loading, setLoading] = useState(false);

  // Authenticate client
  const authenticateClient = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Client authentication error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      if (data) {
        localStorage.setItem('clientAuth', JSON.stringify({
          id: data.id,
          name: data.name
        }));
        
        return { success: true, client: data };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Error during client authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Register client
  const registerClient = async (name: string, password: string, phone: string, email?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_auth')
        .insert({
          name,
          password,
          phone,
          email
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering client:', error);
        return { success: false, message: 'Erro ao registrar cliente' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error registering client:', error);
      return { success: false, message: 'Erro ao registrar cliente' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    authenticateClient,
    registerClient
  };
};
