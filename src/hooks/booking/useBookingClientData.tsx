
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

  useEffect(() => {
    const loadClientData = async () => {
      console.log('useBookingClientData - Starting load process');
      
      // Verificações básicas
      if (!isClient || !user?.id) {
        console.log('useBookingClientData - Not client or no user ID:', { isClient, userId: user?.id });
        return;
      }

      // Se já carregou uma vez, não carregar novamente
      if (hasAutoFilled.current) {
        console.log('useBookingClientData - Already auto-filled, skipping');
        return;
      }

      // Se já está carregando, não iniciar novo carregamento
      if (isLoading.current) {
        console.log('useBookingClientData - Already loading, skipping');
        return;
      }

      // Se já tem dados preenchidos (exceto notes), não sobrescrever
      if (clientData.name && clientData.phone) {
        console.log('useBookingClientData - Data already exists, marking as filled');
        hasAutoFilled.current = true;
        return;
      }

      try {
        isLoading.current = true;
        console.log('useBookingClientData - Fetching client data for user:', user.id);

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
          console.log('useBookingClientData - Client data found:', {
            id: clientAuthData.id,
            username: clientAuthData.username,
            name: clientAuthData.name,
            full_name: clientAuthData.full_name,
            phone: clientAuthData.phone,
            email: clientAuthData.email
          });

          // Determinar o melhor nome disponível
          const displayName = clientAuthData.full_name || 
                            clientAuthData.name || 
                            clientAuthData.username || 
                            '';

          const newData: ClientData = {
            name: displayName,
            phone: formatPhoneNumber(clientAuthData.phone || ''),
            email: clientAuthData.email || '',
            notes: clientData.notes || '' // Preservar notes existentes
          };

          console.log('useBookingClientData - Setting new client data:', newData);
          setClientData(newData);
          hasAutoFilled.current = true;
        } else {
          console.log('useBookingClientData - No client data found');
        }
      } catch (error) {
        console.error('useBookingClientData - Error fetching data:', error);
      } finally {
        isLoading.current = false;
      }
    };

    // Executar carregamento após um pequeno delay para garantir que o estado está estabilizado
    const timer = setTimeout(loadClientData, 100);

    return () => clearTimeout(timer);
  }, [user?.id, isClient]); // Dependências mínimas para evitar loops

  // Reset quando os dados são limpos manualmente
  useEffect(() => {
    if (!clientData.name && !clientData.phone && hasAutoFilled.current) {
      console.log('useBookingClientData - Data manually cleared, resetting flags');
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
