
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '../useSupabaseData';
import { useSalonValidation } from './useSalonValidation';

export const useSalonCreate = () => {
  const [loading, setLoading] = useState(false);
  const { validateSalonData, cleanSalonData, handleSupabaseError } = useSalonValidation();

  const createSalon = async (salonData: any) => {
    try {
      setLoading(true);
      console.log('Creating salon with data:', salonData);
      
      // Validate the data
      const validation = validateSalonData(salonData);
      if (!validation.success) {
        return validation;
      }

      // Clean the data before inserting
      const cleanData = cleanSalonData(salonData);
      console.log('Clean salon data:', cleanData);
      
      const { data, error } = await supabase
        .from('salons')
        .insert(cleanData)
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      console.log('Salon created successfully:', data);
      return { success: true, salon: data };
    } catch (error) {
      console.error('Unexpected error creating salon:', error);
      return { success: false, message: 'Erro inesperado ao criar estabelecimento' };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSalon,
    loading
  };
};
