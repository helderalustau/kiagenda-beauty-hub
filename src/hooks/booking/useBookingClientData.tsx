
import { useEffect } from 'react';
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

  // Auto-preencher dados do cliente logado
  useEffect(() => {
    if (user) {
      console.log('Auto-filling client data from logged user:', user);
      setClientData({
        name: user.name || '',
        phone: user.phone || user.id || '', // Usar phone se disponível, senão ID
        email: '',
        notes: clientData.notes || ''
      });
    }
  }, [user, setClientData]);

  return { user };
};
