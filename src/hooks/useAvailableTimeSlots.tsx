
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from './useSupabaseData';

interface TimeSlot {
  time: string;
  available: boolean;
}

export const useAvailableTimeSlots = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateTimeSlots = (openTime: string, closeTime: string, intervalMinutes: number = 30): string[] => {
    const slots: string[] = [];
    
    // Parse opening and closing times
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    console.log('Generating slots from', openTime, 'to', closeTime);
    
    // Generate slots every intervalMinutes
    for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += intervalMinutes) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    console.log('Generated slots:', slots);
    return slots;
  };

  const getBookedSlots = async (salonId: string, date: string): Promise<string[]> => {
    try {
      console.log('Fetching booked slots for salon:', salonId, 'date:', date);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('Error fetching booked slots:', error);
        return [];
      }

      const bookedTimes = data?.map(appointment => appointment.appointment_time) || [];
      console.log('Booked slots found:', bookedTimes);
      return bookedTimes;
    } catch (error) {
      console.error('Error in getBookedSlots:', error);
      return [];
    }
  };

  const getDayOfWeek = (date: Date): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const fetchAvailableSlots = async (salon: Salon, selectedDate: Date) => {
    if (!salon || !selectedDate) {
      console.log('Missing salon or date:', { salon: !!salon, date: !!selectedDate });
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Fetching available slots for:', { 
        salon: salon.name, 
        salonId: salon.id,
        date: selectedDate.toDateString(),
        openingHours: salon.opening_hours 
      });
      
      const dayOfWeek = getDayOfWeek(selectedDate);
      console.log('Day of week:', dayOfWeek);
      
      // Verificar se salon.opening_hours existe e é um objeto válido
      if (!salon.opening_hours || typeof salon.opening_hours !== 'object') {
        console.error('Invalid opening hours structure:', salon.opening_hours);
        setAvailableSlots([]);
        return;
      }
      
      const daySchedule = salon.opening_hours[dayOfWeek];
      console.log('Day schedule:', daySchedule);
      
      if (!daySchedule || daySchedule.closed === true) {
        console.log('Salon is closed on this day');
        setAvailableSlots([]);
        return;
      }

      // Verificar se tem horários de abertura e fechamento válidos
      if (!daySchedule.open || !daySchedule.close) {
        console.error('Missing open/close times:', daySchedule);
        setAvailableSlots([]);
        return;
      }

      // Gerar todos os horários possíveis
      const allSlots = generateTimeSlots(daySchedule.open, daySchedule.close, 30);
      console.log('All possible slots:', allSlots);
      
      if (allSlots.length === 0) {
        console.log('No slots generated');
        setAvailableSlots([]);
        return;
      }
      
      // Buscar horários já ocupados
      const dateString = selectedDate.toISOString().split('T')[0];
      const bookedSlots = await getBookedSlots(salon.id, dateString);
      console.log('Booked slots:', bookedSlots);
      
      // Filtrar horários disponíveis
      const currentTime = new Date();
      const isToday = selectedDate.toDateString() === currentTime.toDateString();
      
      const availableSlots = allSlots.filter(slot => {
        // Se o horário já está reservado, não disponibilizar
        if (bookedSlots.includes(slot)) {
          console.log('Slot already booked:', slot);
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
            console.log('Slot already passed:', slot);
            return false;
          }
        }
        
        return true;
      });
      
      console.log('Final available slots:', availableSlots);
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
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
