
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter';
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
  const { formatPhoneNumber } = usePhoneFormatter();
  const hasAutoFilled = useRef(false);

  // Auto-preencher dados do cliente logado apenas uma vez
  useEffect(() => {
    const loadClientData = async () => {
      if (user && !hasAutoFilled.current) {
        console.log('Auto-filling client data from logged user:', user);
        
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
              name: clientAuthData.username || clientAuthData.name || user.name || '',
              phone: formatPhoneNumber(clientAuthData.phone || ''),
              email: clientAuthData.email || user.email || '',
              notes: clientData.notes || ''
            });
          } else {
            console.log('No client auth data found, using user data');
            
            hasAutoFilled.current = true;
            
            setClientData({
              name: user.name || '',
              phone: formatPhoneNumber(''),
              email: user.email || '',
              notes: clientData.notes || ''
            });
          }
        } catch (error) {
          console.error('Error loading client auth data:', error);
          
          // Fallback para apenas o nome do usuário
          hasAutoFilled.current = true;
          
          setClientData({
            name: user.name || '',
            phone: formatPhoneNumber(''),
            email: user.email || '',
            notes: clientData.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [user, setClientData, formatPhoneNumber, clientData.notes]);

  // Reset do flag quando os dados forem limpos
  useEffect(() => {
    if (!clientData.name && !clientData.phone && hasAutoFilled.current) {
      hasAutoFilled.current = false;
    }
  }, [clientData.name, clientData.phone]);

  return { user, formatPhoneNumber };
};
