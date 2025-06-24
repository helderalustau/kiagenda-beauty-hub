
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from './useSupabaseData';

export const useAvailableTimeSlots = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateTimeSlots = (openTime: string, closeTime: string, intervalMinutes: number = 30): string[] => {
    const slots: string[] = [];
    
    try {
      console.log('🕒 Generating slots from', openTime, 'to', closeTime);
      
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
      
      for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += intervalMinutes) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
      
      console.log('✅ Generated', slots.length, 'slots:', slots);
      return slots;
    } catch (error) {
      console.error('❌ Error generating time slots:', error);
      return [];
    }
  };

  const getBookedSlots = async (salonId: string, date: string): Promise<string[]> => {
    try {
      console.log('🔍 Fetching booked slots for salon:', salonId, 'date:', date);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('❌ Error fetching booked slots:', error);
        // Retornar array vazio para não bloquear agendamentos
        return [];
      }

      const bookedTimes = data?.map(appointment => appointment.appointment_time) || [];
      console.log('📅 Found', bookedTimes.length, 'booked slots:', bookedTimes);
      return bookedTimes;
    } catch (error) {
      console.error('❌ Error in getBookedSlots:', error);
      return [];
    }
  };

  const getDayOfWeek = (date: Date): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const fetchAvailableSlots = async (salon: Salon, selectedDate: Date) => {
    if (!salon || !selectedDate) {
      console.log('❌ Missing salon or date:', { salon: !!salon, date: !!selectedDate });
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Fetching available slots for:', { 
        salon: salon.name, 
        salonId: salon.id,
        date: selectedDate.toDateString(),
        openingHours: salon.opening_hours 
      });
      
      const dayOfWeek = getDayOfWeek(selectedDate);
      console.log('📅 Day of week:', dayOfWeek);
      
      // Verificar se salon.opening_hours existe
      if (!salon.opening_hours || typeof salon.opening_hours !== 'object') {
        console.log('⚠️ No opening hours found, using default schedule (09:00-18:00)');
        const defaultSlots = generateTimeSlots('09:00', '18:00', 30);
        setAvailableSlots(defaultSlots);
        return;
      }
      
      const daySchedule = salon.opening_hours[dayOfWeek];
      console.log('📋 Day schedule for', dayOfWeek, ':', daySchedule);
      
      if (!daySchedule) {
        console.log('⚠️ No schedule for this day, using default (09:00-18:00)');
        const defaultSlots = generateTimeSlots('09:00', '18:00', 30);
        setAvailableSlots(defaultSlots);
        return;
      }
      
      if (daySchedule.closed === true) {
        console.log('🚫 Salon is closed on this day');
        setAvailableSlots([]);
        return;
      }

      // Verificar se tem horários válidos
      const openTime = daySchedule.open || '09:00';
      const closeTime = daySchedule.close || '18:00';
      
      console.log('⏰ Using schedule:', { open: openTime, close: closeTime });

      // Gerar todos os horários possíveis
      const allSlots = generateTimeSlots(openTime, closeTime, 30);
      
      if (allSlots.length === 0) {
        console.log('❌ No slots generated');
        setAvailableSlots([]);
        return;
      }
      
      // Buscar horários já ocupados
      const dateString = selectedDate.toISOString().split('T')[0];
      const bookedSlots = await getBookedSlots(salon.id, dateString);
      
      // Filtrar horários disponíveis
      const currentTime = new Date();
      const isToday = selectedDate.toDateString() === currentTime.toDateString();
      
      const availableSlots = allSlots.filter(slot => {
        // Se o horário já está reservado, não disponibilizar
        if (bookedSlots.includes(slot)) {
          console.log('❌ Slot already booked:', slot);
          return false;
        }
        
        // Se é hoje, não mostrar horários que já passaram
        if (isToday) {
          const [hour, minute] = slot.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(hour, minute, 0, 0);
          
          // Adicionar 1 hora de margem para agendamentos
          const currentTimePlusMargin = new Date(currentTime.getTime() + 60 * 60 * 1000);
          
          if (slotTime <= currentTimePlusMargin) {
            console.log('❌ Slot already passed:', slot);
            return false;
          }
        }
        
        return true;
      });
      
      console.log('✅ Final available slots:', availableSlots.length, 'slots');
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      
      // Em caso de erro, mostrar horários padrão
      console.log('🔄 Using fallback schedule due to error');
      const fallbackSlots = generateTimeSlots('09:00', '18:00', 30);
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  return {
    availableSlots,
    loading,
    fetchAvailableSlots
  };
};
