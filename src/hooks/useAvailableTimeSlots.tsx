
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from './useSupabaseData';

export const useAvailableTimeSlots = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef<string>('');

  const generateTimeSlots = useCallback((openTime: string, closeTime: string, intervalMinutes: number = 30): string[] => {
    const slots: string[] = [];
    
    try {
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
      
      return slots;
    } catch (error) {
      console.error('❌ Error generating time slots:', error);
      return [];
    }
  }, []);

  const getBookedSlots = useCallback(async (salonId: string, date: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('❌ Error fetching booked slots:', error);
        return [];
      }

      return data?.map(appointment => appointment.appointment_time) || [];
    } catch (error) {
      console.error('❌ Error in getBookedSlots:', error);
      return [];
    }
  }, []);

  const getDayOfWeek = useCallback((date: Date): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }, []);

  const fetchAvailableSlots = useCallback(async (salon: Salon, selectedDate: Date) => {
    if (!salon || !selectedDate) {
      console.log('❌ Missing salon or date');
      setAvailableSlots([]);
      return;
    }

    // Criar uma chave única para evitar chamadas duplicadas
    const fetchKey = `${salon.id}-${selectedDate.toDateString()}`;
    if (lastFetchRef.current === fetchKey && !loading) {
      console.log('🔄 Skipping duplicate fetch for:', fetchKey);
      return;
    }

    lastFetchRef.current = fetchKey;
    setLoading(true);
    
    try {
      console.log('🚀 Fetching available slots for:', { 
        salon: salon.name, 
        date: selectedDate.toDateString()
      });
      
      const dayOfWeek = getDayOfWeek(selectedDate);
      
      // Verificar se salon.opening_hours existe
      if (!salon.opening_hours || typeof salon.opening_hours !== 'object') {
        console.log('⚠️ No opening hours found, using default schedule (09:00-18:00)');
        const defaultSlots = generateTimeSlots('09:00', '18:00', 30);
        setAvailableSlots(defaultSlots);
        return;
      }
      
      const daySchedule = salon.opening_hours[dayOfWeek];
      
      if (!daySchedule || daySchedule.closed === true) {
        console.log('🚫 Salon is closed on this day');
        setAvailableSlots([]);
        return;
      }

      const openTime = daySchedule.open || '09:00';
      const closeTime = daySchedule.close || '18:00';

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
        if (bookedSlots.includes(slot)) {
          return false;
        }
        
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
      
      console.log('✅ Final available slots:', availableSlots.length, 'slots');
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      const fallbackSlots = generateTimeSlots('09:00', '18:00', 30);
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  }, [generateTimeSlots, getBookedSlots, getDayOfWeek, loading]);

  return {
    availableSlots,
    loading,
    fetchAvailableSlots
  };
};
