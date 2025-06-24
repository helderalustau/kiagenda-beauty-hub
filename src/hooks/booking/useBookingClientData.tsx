
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

  // Auto-preencher dados do cliente logado apenas uma vez
  useEffect(() => {
    const loadClientData = () => {
      if (user && !hasAutoFilled.current && !clientData.name) {
        console.log('Auto-filling client data from logged user (once):', user);
        
        hasAutoFilled.current = true;
        
        setClientData({
          name: user.name || '',
          phone: clientData.phone || '', // Manter o valor atual do phone
          email: clientData.email || '', // Manter o valor atual do email
          notes: clientData.notes || ''
        });
      }
    };

    loadClientData();
  }, [user, clientData.name, clientData.phone, clientData.email, clientData.notes, setClientData]);

  // Reset do flag quando o modal for fechado (clientData limpo)
  useEffect(() => {
    if (!clientData.name && !clientData.phone && hasAutoFilled.current) {
      hasAutoFilled.current = false;
    }
  }, [clientData.name, clientData.phone]);

  return { user };
};
