
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableTimeSlots = (
  salonId: string | undefined, 
  selectedDate: Date | undefined,
  serviceId: string | undefined = undefined
) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = useCallback(async () => {
    if (!salonId || !selectedDate) {
      setAvailableSlots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching available slots');
      console.log('📋 Parameters:', { salonId, selectedDate: selectedDate.toDateString(), serviceId });
      
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // Chamar a função corrigida
      const { data, error } = await supabase.rpc('get_available_time_slots', {
        p_salon_id: salonId,
        p_date: dateString,
        p_service_id: serviceId || null
      });

      if (error) {
        console.error('❌ Error fetching available slots:', error);
        setError(error.message);
        setAvailableSlots([]);
      } else {
        const slots = data?.map((slot: { time_slot: string }) => slot.time_slot) || [];
        console.log('✅ Available slots:', slots);
        setAvailableSlots(slots);
      }
    } catch (err) {
      console.error('❌ Exception fetching available slots:', err);
      setError('Erro ao buscar horários disponíveis');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [salonId, selectedDate, serviceId]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  return {
    availableSlots,
    loading,
    error,
    refetch: fetchAvailableSlots
  };
};
