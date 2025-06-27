
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
    console.log('🔍 fetchAvailableSlots called with:', { 
      salonId, 
      selectedDate: selectedDate?.toDateString(), 
      serviceId 
    });

    if (!salonId || !selectedDate) {
      console.log('❌ Missing required parameters');
      setAvailableSlots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      console.log('📋 Calling RPC with parameters:', { 
        p_salon_id: salonId, 
        p_date: dateString, 
        p_service_id: serviceId || null 
      });
      
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
        console.log('✅ Available slots received:', slots);
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
    console.log('📡 useAvailableTimeSlots useEffect triggered');
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  return {
    availableSlots,
    loading,
    error,
    refetch: fetchAvailableSlots
  };
};
