
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/hooks/useSupabaseData';

export const useOptimizedTimeSlots = (salon: Salon, selectedDate: Date | undefined) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Geração otimizada de slots de tempo
  const generateTimeSlots = useCallback((openTime: string, closeTime: string): string[] => {
    try {
      const slots: string[] = [];
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      
      if (isNaN(openHour) || isNaN(openMinute) || isNaN(closeHour) || isNaN(closeMinute)) {
        console.error('❌ Invalid time format:', { openTime, closeTime });
        return [];
      }
      
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;
      
      if (openTimeInMinutes >= closeTimeInMinutes) {
        console.error('❌ Opening time is not before closing time');
        return [];
      }
      
      // Gerar slots a cada 30 minutos
      for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
      
      console.log(`✅ Generated ${slots.length} time slots from ${openTime} to ${closeTime}`);
      return slots;
    } catch (error) {
      console.error('❌ Error generating time slots:', error);
      return [];
    }
  }, []);

  // Buscar slots ocupados
  const fetchBookedSlots = useCallback(async (salonId: string, date: string): Promise<string[]> => {
    try {
      console.log(`🔍 Fetching booked slots for salon ${salonId} on ${date}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_time');

      if (error) {
        console.error('❌ Error fetching booked slots:', error);
        return [];
      }

      const bookedTimes = data?.map(appointment => appointment.appointment_time) || [];
      console.log(`📅 Found ${bookedTimes.length} booked slots:`, bookedTimes);
      return bookedTimes;
    } catch (error) {
      console.error('❌ Error in fetchBookedSlots:', error);
      return [];
    }
  }, []);

  // Filtrar slots disponíveis
  const filterAvailableSlots = useCallback((allSlots: string[], bookedSlots: string[], date: Date) => {
    const currentTime = new Date();
    const isToday = date.toDateString() === currentTime.toDateString();
    
    return allSlots.filter(slot => {
      // Se já está reservado, não disponibilizar
      if (bookedSlots.includes(slot)) {
        return false;
      }
      
      // Se é hoje, não mostrar horários que já passaram (com margem de 1 hora)
      if (isToday) {
        const [hour, minute] = slot.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        
        const currentTimePlusMargin = new Date(currentTime.getTime() + 60 * 60 * 1000);
        if (slotTime <= currentTimePlusMargin) {
          return false;
        }
      }
      
      return true;
    });
  }, []);

  // Buscar slots disponíveis - função principal
  const fetchAvailableSlots = useCallback(async () => {
    // Validações iniciais
    if (!salon?.id) {
      console.log('❌ No salon ID provided');
      setAvailableSlots([]);
      return;
    }

    if (!selectedDate) {
      console.log('❌ No date selected');
      setAvailableSlots([]);
      return;
    }

    if (!salon.opening_hours || typeof salon.opening_hours !== 'object') {
      console.log('❌ No opening hours found in salon data');
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    
    try {
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
      const daySchedule = salon.opening_hours[dayOfWeek];
      
      console.log(`📅 Checking schedule for ${dayOfWeek}:`, daySchedule);
      
      if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
        console.log(`🚫 Salon closed on ${dayOfWeek}`);
        setAvailableSlots([]);
        return;
      }

      // Gerar todos os slots possíveis
      const allSlots = generateTimeSlots(daySchedule.open, daySchedule.close);
      
      if (allSlots.length === 0) {
        console.log('❌ No slots generated');
        setAvailableSlots([]);
        return;
      }
      
      // Buscar slots ocupados
      const dateString = selectedDate.toISOString().split('T')[0];
      const bookedSlots = await fetchBookedSlots(salon.id, dateString);
      
      // Filtrar slots disponíveis
      const availableSlots = filterAvailableSlots(allSlots, bookedSlots, selectedDate);
      
      console.log(`✅ Final available slots (${availableSlots.length}):`, availableSlots);
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [salon?.id, salon?.opening_hours, selectedDate, generateTimeSlots, fetchBookedSlots, filterAvailableSlots]);

  // Effect para buscar slots quando data ou salon mudar
  useEffect(() => {
    console.log('🔄 useOptimizedTimeSlots effect triggered:', {
      hasSalon: !!salon?.id,
      hasDate: !!selectedDate,
      salonName: salon?.name,
      date: selectedDate?.toDateString()
    });
    
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  return {
    availableSlots,
    loading,
    refetchSlots: fetchAvailableSlots
  };
};
