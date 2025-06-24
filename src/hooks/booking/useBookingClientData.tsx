
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

  // Auto-preencher dados do cliente logado apenas uma vez
  useEffect(() => {
    const loadClientData = async () => {
      if (user && !hasAutoFilled.current && !clientData.name) {
        console.log('Auto-filling client data from logged user (once):', user);
        
        try {
          // Buscar dados do cliente na tabela client_auth pelo ID do usuário logado
          const { data: clientAuthData, error } = await supabase
            .from('client_auth')
            .select('name, phone, email')
            .eq('id', user.id)
            .single();

          if (!error && clientAuthData) {
            console.log('Found client auth data:', clientAuthData);
            
            hasAutoFilled.current = true;
            
            setClientData({
              name: clientAuthData.name || '',
              phone: clientAuthData.phone || '',
              email: clientAuthData.email || '',
              notes: clientData.notes || ''
            });
          } else {
            console.log('No client auth data found for user ID, trying by name');
            
            // Fallback: buscar pelo nome como antes
            const { data: clientAuthByName, error: nameError } = await supabase
              .from('client_auth')
              .select('name, phone, email')
              .eq('name', user.name)
              .single();

            if (!nameError && clientAuthByName) {
              console.log('Found client auth data by name:', clientAuthByName);
              
              hasAutoFilled.current = true;
              
              setClientData({
                name: clientAuthByName.name || '',
                phone: clientAuthByName.phone || '',
                email: clientAuthByName.email || '',
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

  return { user };
};
