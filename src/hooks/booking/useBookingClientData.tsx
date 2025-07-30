
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

  // Buscar dados do cliente diretamente do banco de dados
  useEffect(() => {
    const loadClientData = async () => {
      console.log('useBookingClientData - Starting database load');

      // Verificações de segurança
      if (hasAutoFilled.current || isLoading.current || !isClient || !user?.id) {
        console.log('useBookingClientData - Skipping load:', {
          hasAutoFilled: hasAutoFilled.current,
          isLoading: isLoading.current,
          isClient,
          userId: user?.id
        });
        return;
      }

      // Se já tem dados preenchidos, não sobrescrever
      if (clientData.name && clientData.phone) {
        console.log('useBookingClientData - Data already exists, marking as filled');
        hasAutoFilled.current = true;
        return;
      }

      try {
        isLoading.current = true;
        console.log('useBookingClientData - Fetching client data from database for user:', user.id);

        // Buscar dados do cliente no banco de dados
        const { data: clientAuthData, error } = await supabase
          .from('client_auth')
          .select('id, username, name, full_name, phone, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('useBookingClientData - Database error:', error);
          return;
        }

        if (clientAuthData) {
          console.log('useBookingClientData - Database data found:', {
            id: clientAuthData.id,
            username: clientAuthData.username,
            name: clientAuthData.name,
            full_name: clientAuthData.full_name,
            phone: clientAuthData.phone,
            email: clientAuthData.email
          });

          const newData = {
            name: clientAuthData.full_name || clientAuthData.name || clientAuthData.username || '',
            phone: formatPhoneNumber(clientAuthData.phone || ''),
            email: clientAuthData.email || '',
            notes: clientData.notes || ''
          };

          console.log('useBookingClientData - Setting new client data from database:', newData);
          setClientData(newData);
          hasAutoFilled.current = true;
        } else {
          console.log('useBookingClientData - No client data found in database');
        }
      } catch (error) {
        console.error('useBookingClientData - Error fetching from database:', error);
      } finally {
        isLoading.current = false;
      }
    };

    // Executar após um pequeno delay para garantir que o user está carregado
    const timer = setTimeout(() => {
      loadClientData();
    }, 200);

    return () => clearTimeout(timer);
  }, [user?.id, isClient, setClientData, formatPhoneNumber, clientData.notes, clientData.name, clientData.phone]);

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
