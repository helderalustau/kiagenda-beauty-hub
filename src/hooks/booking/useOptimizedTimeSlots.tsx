
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/hooks/useSupabaseData';

export const useOptimizedTimeSlots = (salon: Salon, selectedDate: Date | undefined) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Geração otimizada de slots de tempo
  const generateTimeSlots = useMemo(() => {
    if (!salon?.opening_hours || !selectedDate) {
      console.log('❌ Missing salon opening hours or selected date');
      return [];
    }

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
    const daySchedule = salon.opening_hours[dayOfWeek];
    
    if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
      console.log(`❌ Salon closed on ${dayOfWeek}`);
      return [];
    }

    const slots: string[] = [];
    const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    console.log(`⏰ Generating slots from ${daySchedule.open} to ${daySchedule.close}`);
    
    // Gerar slots a cada 30 minutos
    for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    console.log(`✅ Generated ${slots.length} time slots:`, slots);
    return slots;
  }, [salon?.opening_hours, selectedDate]);

  // Buscar slots ocupados otimizado
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
        // Retornar array vazio para não bloquear agendamentos
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
    
    const availableSlots = allSlots.filter(slot => {
      // Se já está reservado, não disponibilizar
      if (bookedSlots.includes(slot)) {
        console.log(`❌ Slot ${slot} already booked`);
        return false;
      }
      
      // Se é hoje, não mostrar horários que já passaram (com margem de 1 hora)
      if (isToday) {
        const [hour, minute] = slot.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        
        const currentTimePlusMargin = new Date(currentTime.getTime() + 60 * 60 * 1000);
        if (slotTime <= currentTimePlusMargin) {
          console.log(`❌ Slot ${slot} already passed`);
          return false;
        }
      }
      
      return true;
    });

    console.log(`✅ Filtered to ${availableSlots.length} available slots:`, availableSlots);
    return availableSlots;
  }, []);

  // Buscar slots disponíveis
  const fetchAvailableSlots = useCallback(async () => {
    if (!salon?.id || !selectedDate) {
      console.log('❌ Missing required data for fetching slots');
      setAvailableSlots([]);
      return;
    }

    // Se não há slots gerados, mostrar erro mais claro
    if (generateTimeSlots.length === 0) {
      console.log('❌ No time slots generated - salon might be closed');
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      console.log(`🚀 Fetching available slots for ${dateString}`);
      
      const bookedSlots = await fetchBookedSlots(salon.id, dateString);
      const availableSlots = filterAvailableSlots(generateTimeSlots, bookedSlots, selectedDate);
      
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      // Em caso de erro, mostrar todos os slots gerados
      setAvailableSlots(generateTimeSlots);
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
