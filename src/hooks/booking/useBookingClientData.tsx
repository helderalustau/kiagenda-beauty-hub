
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
      if (user && !hasAutoFilled.current && !clientData.name && !clientData.phone) {
        console.log('Auto-filling client data from logged user (once):', user);
        
        hasAutoFilled.current = true;
        
        setClientData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          notes: clientData.notes || ''
        });
      }
    };

    loadClientData();
  }, [user]); // Remover dependências que causam loops

  // Reset do flag quando o modal for fechado (clientData limpo)
  useEffect(() => {
    if (!clientData.name && !clientData.phone && hasAutoFilled.current) {
      hasAutoFilled.current = false;
    }
  }, [clientData.name, clientData.phone]);

  return { user };
};
