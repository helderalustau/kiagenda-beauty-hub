
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter';

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

  // Auto-preencher dados do cliente logado através do localStorage
  useEffect(() => {
    const loadClientData = async () => {
      console.log('useBookingClientData - Starting load');

      // Verificações de segurança
      if (hasAutoFilled.current || isLoading.current) {
        console.log('useBookingClientData - Already processed or loading');
        return;
      }

      // Se já tem dados preenchidos, não sobrescrever
      if (clientData.name && clientData.phone) {
        console.log('useBookingClientData - Data already exists, marking as filled');
        hasAutoFilled.current = true;
        return;
      }

      // Tentar obter dados do localStorage (cliente logado)
      const clientAuth = localStorage.getItem('clientAuth');
      if (!clientAuth) {
        console.log('useBookingClientData - No client auth in localStorage');
        return;
      }

      try {
        isLoading.current = true;
        const loggedClient = JSON.parse(clientAuth);
        
        console.log('useBookingClientData - Client auth data found:', {
          username: loggedClient.username,
          name: loggedClient.name,
          phone: loggedClient.phone,
          email: loggedClient.email
        });
        
        const newData = {
          name: loggedClient.name || loggedClient.username || '',
          phone: formatPhoneNumber(loggedClient.phone || ''),
          email: loggedClient.email || '',
          notes: clientData.notes || ''
        };

        console.log('useBookingClientData - Setting new client data:', newData);
        setClientData(newData);
        hasAutoFilled.current = true;
      } catch (error) {
        console.error('useBookingClientData - Error parsing client auth:', error);
      } finally {
        isLoading.current = false;
      }
    };

    // Executar após um pequeno delay
    const timer = setTimeout(() => {
      loadClientData();
    }, 200);

    return () => clearTimeout(timer);
  }, [setClientData, formatPhoneNumber, clientData.notes]);

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
