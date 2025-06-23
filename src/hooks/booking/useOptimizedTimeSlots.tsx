
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/hooks/useSupabaseData';

export const useOptimizedTimeSlots = (salon: Salon, selectedDate: Date | undefined) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Otimizada: geração de slots usando useMemo
  const generateTimeSlots = useMemo(() => {
    if (!salon?.opening_hours || !selectedDate) return [];

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
    const daySchedule = salon.opening_hours[dayOfWeek];
    
    if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
      return [];
    }

    const slots: string[] = [];
    const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    // Gerar slots a cada 30 minutos
    for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    return slots;
  }, [salon?.opening_hours, selectedDate]);

  // Otimizada: busca de slots ocupados com cache
  const fetchBookedSlots = useCallback(async (salonId: string, date: string): Promise<string[]> => {
    try {
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

      return data?.map(appointment => appointment.appointment_time) || [];
    } catch (error) {
      console.error('❌ Error in fetchBookedSlots:', error);
      return [];
    }
  }, []);

  // Otimizada: filtrar slots disponíveis
  const filterAvailableSlots = useCallback((allSlots: string[], bookedSlots: string[], date: Date) => {
    const currentTime = new Date();
    const isToday = date.toDateString() === currentTime.toDateString();
    
    return allSlots.filter(slot => {
      // Se já está reservado, não disponibilizar
      if (bookedSlots.includes(slot)) return false;
      
      // Se é hoje, não mostrar horários que já passaram (com margem de 1 hora)
      if (isToday) {
        const [hour, minute] = slot.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        
        const currentTimePlusMargin = new Date(currentTime.getTime() + 60 * 60 * 1000);
        if (slotTime <= currentTimePlusMargin) return false;
      }
      
      return true;
    });
  }, []);

  // Otimizada: buscar slots disponíveis
  const fetchAvailableSlots = useCallback(async () => {
    if (!salon?.id || !selectedDate || generateTimeSlots.length === 0) {
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const bookedSlots = await fetchBookedSlots(salon.id, dateString);
      const availableSlots = filterAvailableSlots(generateTimeSlots, bookedSlots, selectedDate);
      
      console.log(`📅 Available slots for ${dateString}:`, availableSlots.length);
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [salon?.id, selectedDate, generateTimeSlots, fetchBookedSlots, filterAvailableSlots]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  return {
    availableSlots,
    loading,
    refetchSlots: fetchAvailableSlots
  };
};
