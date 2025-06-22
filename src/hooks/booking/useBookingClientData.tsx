
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientData } from '@/hooks/useClientData';

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
  const { getClientByPhone } = useClientData();

  // Auto-preencher dados do cliente logado
  useEffect(() => {
    const loadClientData = async () => {
      if (user) {
        console.log('Auto-filling client data from logged user:', user);
        
        // Tentar buscar dados reais do cliente baseado no ID do usuário
        const clientResult = await getClientByPhone(user.id);
        
        if (clientResult.success && clientResult.client) {
          // Usar dados reais do cliente
          setClientData({
            name: clientResult.client.name || user.name || '',
            phone: clientResult.client.phone || '',
            email: clientResult.client.email || '',
            notes: clientData.notes || ''
          });
        } else {
          // Fallback para dados básicos do usuário
          setClientData({
            name: user.name || '',
            phone: '', // Deixar vazio para o usuário preencher
            email: '',
            notes: clientData.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [user, setClientData, getClientByPhone]);

  return { user };
};
