
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableTimeSlots = (
  salonId: string | undefined, 
  selectedDate: Date | undefined,
  serviceId: string | undefined = undefined
) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent duplicate calls
  const lastFetchParams = useRef<string>('');

  const fetchAvailableSlots = useCallback(async () => {
    // Early validation
    if (!salonId || !selectedDate) {
      console.log('❌ Missing required parameters for time slots');
      setAvailableSlots([]);
      setLoading(false);
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const currentParams = `${salonId}-${dateString}-${serviceId || 'no-service'}`;
    
    // Prevent duplicate calls
    if (lastFetchParams.current === currentParams) {
      console.log('⚠️ Skipping duplicate time slots fetch');
      return;
    }

    lastFetchParams.current = currentParams;
    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching time slots for:', {
        salon: salonId,
        date: dateString,
        service: serviceId
      });
      
      const { data, error: rpcError } = await supabase.rpc('get_available_time_slots', {
        p_salon_id: salonId,
        p_date: dateString,
        p_service_id: serviceId || null
      });

      if (rpcError) {
        console.error('❌ Error fetching time slots:', rpcError);
        setError(rpcError.message);
        setAvailableSlots([]);
      } else {
        const slots = data?.map((slot: { time_slot: string }) => slot.time_slot) || [];
        console.log('✅ Time slots received:', slots);
        setAvailableSlots(slots);
      }
    } catch (err: any) {
      console.error('❌ Exception fetching time slots:', err);
      setError('Erro ao buscar horários disponíveis');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [salonId, selectedDate, serviceId]);

  // Single useEffect with proper dependency management
  useEffect(() => {
    // Only fetch if we have required params
    if (salonId && selectedDate) {
      console.log('🔄 Time slots effect triggered');
      
      // Small delay to prevent rapid successive calls
      const timer = setTimeout(fetchAvailableSlots, 200);
      return () => clearTimeout(timer);
    } else {
      // Clear slots if params are missing
      setAvailableSlots([]);
      setLoading(false);
      lastFetchParams.current = '';
    }
  }, [salonId, selectedDate, serviceId, fetchAvailableSlots]);

  return {
    availableSlots,
    loading,
    error,
    refetch: fetchAvailableSlots
  };
};
