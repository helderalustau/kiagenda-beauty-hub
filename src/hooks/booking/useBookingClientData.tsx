
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useBookingClientData = (
  clientData: ClientData,
  setClientData: (data: ClientData) => void
) => {
  const { user } = useAuth();
  const hasAutoFilled = useRef(false);

  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,5})/, '($1) $2')
        .replace(/(\d{2})/, '($1');
    }
    return value;
  };

  // Auto-preencher dados do cliente logado apenas uma vez
  useEffect(() => {
    const loadClientData = async () => {
      if (user && !hasAutoFilled.current && !clientData.name) {
        console.log('Auto-filling client data from logged user (once):', user);
        
        try {
          // Buscar dados do cliente na tabela client_auth pelo ID do usuário logado
          const { data: clientAuthData, error } = await supabase
            .from('client_auth')
            .select('username, name, phone, email')
            .eq('id', user.id)
            .single();

          if (!error && clientAuthData) {
            console.log('Found client auth data:', clientAuthData);
            
            hasAutoFilled.current = true;
            
            setClientData({
              name: clientAuthData.username || clientAuthData.name || '',
              phone: formatPhoneNumber(clientAuthData.phone || ''),
              email: clientAuthData.email || '',
              notes: clientData.notes || ''
            });
          } else {
            console.log('No client auth data found for user ID, trying by username');
            
            // Fallback: buscar pelo username como antes
            const { data: clientAuthByUsername, error: usernameError } = await supabase
              .from('client_auth')
              .select('username, name, phone, email')
              .eq('username', user.name)
              .single();

            if (!usernameError && clientAuthByUsername) {
              console.log('Found client auth data by username:', clientAuthByUsername);
              
              hasAutoFilled.current = true;
              
              setClientData({
                name: clientAuthByUsername.username || clientAuthByUsername.name || '',
                phone: formatPhoneNumber(clientAuthByUsername.phone || ''),
                email: clientAuthByUsername.email || '',
                notes: clientData.notes || ''
              });
            } else {
              console.log('No client auth data found, using only name from user');
              
              hasAutoFilled.current = true;
              
              setClientData({
                name: user.name || '',
                phone: '',
                email: '',
                notes: clientData.notes || ''
              });
            }
          }
        } catch (error) {
          console.error('Error loading client auth data:', error);
          
          // Fallback para apenas o nome do usuário
          hasAutoFilled.current = true;
          
          setClientData({
            name: user.name || '',
            phone: '',
            email: '',
            notes: clientData.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [user, clientData.name, setClientData]);

  // Reset do flag quando o modal for fechado (clientData limpo)
  useEffect(() => {
    if (!clientData.name && !clientData.phone && hasAutoFilled.current) {
      hasAutoFilled.current = false;
    }
  }, [clientData.name, clientData.phone]);

  return { user, formatPhoneNumber };
};
