
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
  const { user, isClient } = useAuth();
  const { formatPhoneNumber } = usePhoneFormatter();
  const hasAutoFilled = useRef(false);
  const isLoading = useRef(false);

  // Auto-preencher dados do cliente logado apenas uma vez
  useEffect(() => {
    const loadClientData = async () => {
      console.log('useBookingClientData - Starting load for user:', {
        userId: user?.id,
        isClient,
        hasAutoFilled: hasAutoFilled.current,
        isLoading: isLoading.current,
        hasExistingData: !!(clientData.name && clientData.phone)
      });

      // Verificações de segurança
      if (!user?.id || !isClient) {
        console.log('useBookingClientData - User not valid for auto-fill');
        return;
      }

      if (hasAutoFilled.current || isLoading.current) {
        console.log('useBookingClientData - Already processed or loading');
        return;
      }

      // Se já tem dados, não sobrescrever
      if (clientData.name && clientData.phone) {
        console.log('useBookingClientData - Data already exists, skipping');
        hasAutoFilled.current = true;
        return;
      }

      isLoading.current = true;

      try {
        console.log('useBookingClientData - Fetching client auth data');
        
        const { data: clientAuthData, error } = await supabase
          .from('client_auth')
          .select('username, name, phone, email')
          .eq('id', user.id)
          .single();

        if (!error && clientAuthData) {
          console.log('useBookingClientData - Client auth data found:', {
            username: clientAuthData.username,
            name: clientAuthData.name,
            phone: clientAuthData.phone,
            email: clientAuthData.email
          });
          
          const newData = {
            name: clientAuthData.username || clientAuthData.name || user.name || '',
            phone: formatPhoneNumber(clientAuthData.phone || ''),
            email: clientAuthData.email || user.email || '',
            notes: clientData.notes || ''
          };

          console.log('useBookingClientData - Setting new client data:', newData);
          setClientData(newData);
          hasAutoFilled.current = true;
        } else {
          console.log('useBookingClientData - No client auth data, using fallback');
          
          const fallbackData = {
            name: user.name || '',
            phone: formatPhoneNumber(''),
            email: user.email || '',
            notes: clientData.notes || ''
          };

          console.log('useBookingClientData - Setting fallback data:', fallbackData);
          setClientData(fallbackData);
          hasAutoFilled.current = true;
        }
      } catch (error) {
        console.error('useBookingClientData - Error loading client data:', error);
        
        // Fallback em caso de erro
        const errorFallbackData = {
          name: user.name || '',
          phone: formatPhoneNumber(''),
          email: user.email || '',
          notes: clientData.notes || ''
        };

        console.log('useBookingClientData - Setting error fallback data:', errorFallbackData);
        setClientData(errorFallbackData);
        hasAutoFilled.current = true;
      } finally {
        isLoading.current = false;
      }
    };

    // Delay para evitar múltiplas chamadas
    const timer = setTimeout(() => {
      loadClientData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user?.id, isClient, setClientData, formatPhoneNumber, clientData.notes]);

  // Reset do flag quando os dados forem limpos manualmente
  useEffect(() => {
    if (!clientData.name && !clientData.phone && hasAutoFilled.current) {
      console.log('useBookingClientData - Data cleared, resetting flag');
      hasAutoFilled.current = false;
      isLoading.current = false;
    }
  }, [clientData.name, clientData.phone]);

  return { 
    user, 
    isClient,
    formatPhoneNumber,
    hasAutoFilled: hasAutoFilled.current,
    isLoading: isLoading.current
  };
};
