
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';

export const useSalonCreate = () => {
  const [loading, setLoading] = useState(false);

  const createSalon = async (salonData: any) => {
    try {
      setLoading(true);
      console.log('Creating salon with data:', salonData);

      const { data, error } = await supabase
        .from('salons')
        .insert([salonData])
        .select()
        .single();

      if (error) {
        console.error('Error creating salon:', error);
        return { 
          success: false, 
          message: error.message || 'Erro ao criar estabelecimento' 
        };
      }

      console.log('Salon created successfully:', data);
      return { 
        success: true, 
        salon: data as Salon 
      };
    } catch (error) {
      console.error('Unexpected error creating salon:', error);
      return { 
        success: false, 
        message: 'Erro inesperado ao criar estabelecimento' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSalon,
    loading
  };
};
