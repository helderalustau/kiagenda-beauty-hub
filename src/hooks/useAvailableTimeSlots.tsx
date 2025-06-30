
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
  const isCurrentlyFetching = useRef(false);

  const fetchAvailableSlots = useCallback(async () => {
    console.log('🔍 fetchAvailableSlots called with:', { 
      salonId, 
      selectedDate: selectedDate?.toDateString(), 
      serviceId 
    });

    // Early validation
    if (!salonId || !selectedDate) {
      console.log('❌ Missing required parameters for time slots');
      setAvailableSlots([]);
      setLoading(false);
      setError(null);
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const currentParams = `${salonId}-${dateString}-${serviceId || 'no-service'}`;
    
    // Prevent duplicate calls
    if (lastFetchParams.current === currentParams || isCurrentlyFetching.current) {
      console.log('⚠️ Skipping duplicate time slots fetch or already fetching');
      return;
    }

    lastFetchParams.current = currentParams;
    isCurrentlyFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching time slots for:', {
        salon: salonId,
        date: dateString,
        service: serviceId
      });
      
      // Sempre usar fallback para gerar horários
      console.log('🔄 Using fallback time slot generation');
      
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('opening_hours')
        .eq('id', salonId)
        .single();
        
      if (!salonError && salonData?.opening_hours) {
        const fallbackSlots = generateFallbackTimeSlots(salonData.opening_hours, selectedDate);
        console.log('✅ Fallback slots generated:', fallbackSlots);
        setAvailableSlots(fallbackSlots);
        setError(null);
      } else {
        // Horários padrão se não encontrar configuração
        const defaultSlots = generateDefaultTimeSlots(selectedDate);
        console.log('✅ Default slots generated:', defaultSlots);
        setAvailableSlots(defaultSlots);
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Exception fetching time slots:', err);
      // Mesmo com erro, fornecer horários padrão
      const defaultSlots = generateDefaultTimeSlots(selectedDate);
      setAvailableSlots(defaultSlots);
      setError('Usando horários padrão');
    } finally {
      setLoading(false);
      isCurrentlyFetching.current = false;
    }
  }, [salonId, selectedDate, serviceId]);

  // Generate fallback time slots when RPC fails
  const generateFallbackTimeSlots = (openingHours: any, date: Date) => {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const daySchedule = openingHours[dayOfWeek];
    
    if (!daySchedule || daySchedule.closed === true) {
      return [];
    }
    
    const slots: string[] = [];
    const [openHour, openMinute] = (daySchedule.open || '08:00').split(':').map(Number);
    const [closeHour, closeMinute] = (daySchedule.close || '18:00').split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    // Gerar slots a cada 30 minutos
    for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Se é hoje, só mostrar horários futuros (com margem de 1 hora)
      if (date.toDateString() === new Date().toDateString()) {
        const now = new Date();
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        
        if (slotTime > new Date(now.getTime() + 60 * 60 * 1000)) {
          slots.push(timeString);
        }
      } else {
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  // Generate default time slots (8:00 - 18:00)
  const generateDefaultTimeSlots = (date: Date) => {
    const slots: string[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Se é hoje, só mostrar horários futuros
        if (date.toDateString() === new Date().toDateString()) {
          const now = new Date();
          const slotTime = new Date();
          slotTime.setHours(hour, minute, 0, 0);
          
          if (slotTime > new Date(now.getTime() + 60 * 60 * 1000)) {
            slots.push(timeString);
          }
        } else {
          slots.push(timeString);
        }
      }
    }
    
    return slots;
  };

  // Single useEffect with proper dependency management
  useEffect(() => {
    console.log('🔄 Time slots effect triggered with:', { 
      salonId, 
      selectedDate: selectedDate?.toDateString(), 
      serviceId 
    });
    
    // Only fetch if we have required params
    if (salonId && selectedDate) {
      // Small delay to prevent rapid successive calls
      const timer = setTimeout(() => {
        fetchAvailableSlots();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Clear slots if params are missing
      console.log('🧹 Clearing slots - missing params');
      setAvailableSlots([]);
      setLoading(false);
      setError(null);
      lastFetchParams.current = '';
    }
  }, [fetchAvailableSlots]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch requested');
    lastFetchParams.current = '';
    isCurrentlyFetching.current = false;
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  return {
    availableSlots,
    loading,
    error,
    refetch
  };
};
