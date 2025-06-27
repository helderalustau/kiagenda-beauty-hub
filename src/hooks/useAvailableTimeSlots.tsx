
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
  
  // Use refs to track last fetch parameters and prevent duplicate calls
  const lastFetchParams = useRef<{
    salonId?: string;
    date?: string;
    serviceId?: string;
  }>({});
  const fetchController = useRef<AbortController | null>(null);

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

    const dateString = selectedDate.toISOString().split('T')[0];
    const currentParams = {
      salonId,
      date: dateString,
      serviceId: serviceId || undefined
    };

    // Check if we're fetching the same data
    const lastParams = lastFetchParams.current;
    if (
      lastParams.salonId === currentParams.salonId &&
      lastParams.date === currentParams.date &&
      lastParams.serviceId === currentParams.serviceId
    ) {
      console.log('⚠️ Skipping duplicate fetch with same parameters');
      return;
    }

    // Cancel previous fetch if still running
    if (fetchController.current) {
      fetchController.current.abort();
    }

    // Create new abort controller for this fetch
    fetchController.current = new AbortController();
    lastFetchParams.current = currentParams;

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Calling RPC with parameters:', { 
        p_salon_id: salonId, 
        p_date: dateString, 
        p_service_id: serviceId || null 
      });
      
      // Call the corrected function
      const { data, error: rpcError } = await supabase.rpc('get_available_time_slots', {
        p_salon_id: salonId,
        p_date: dateString,
        p_service_id: serviceId || null
      });

      // Check if request was aborted
      if (fetchController.current?.signal.aborted) {
        console.log('🚫 Request was aborted');
        return;
      }

      if (rpcError) {
        console.error('❌ Error fetching available slots:', rpcError);
        setError(rpcError.message);
        setAvailableSlots([]);
      } else {
        const slots = data?.map((slot: { time_slot: string }) => slot.time_slot) || [];
        console.log('✅ Available slots received:', slots);
        setAvailableSlots(slots);
      }
    } catch (err: any) {
      // Don't log error if request was aborted
      if (err.name !== 'AbortError') {
        console.error('❌ Exception fetching available slots:', err);
        setError('Erro ao buscar horários disponíveis');
        setAvailableSlots([]);
      }
    } finally {
      if (!fetchController.current?.signal.aborted) {
        setLoading(false);
      }
      fetchController.current = null;
    }
  }, [salonId, selectedDate, serviceId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('📡 useAvailableTimeSlots useEffect triggered');
      fetchAvailableSlots();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cancel any ongoing fetch when dependencies change
      if (fetchController.current) {
        fetchController.current.abort();
        fetchController.current = null;
      }
    };
  }, [fetchAvailableSlots]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, []);

  return {
    availableSlots,
    loading,
    error,
    refetch: fetchAvailableSlots
  };
};
