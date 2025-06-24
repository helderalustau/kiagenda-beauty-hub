
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/hooks/useSupabaseData';

export const useBookingTimeSlots = (salon: Salon) => {
  const { toast } = useToast();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Gerar horários disponíveis - função melhorada
  const generateTimeSlots = useCallback((date: Date) => {
    console.log('🕒 Generating time slots for:', date.toDateString());
    
    if (!salon?.opening_hours || !date) {
      console.log('❌ Missing salon opening hours or date');
      return [];
    }

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const daySchedule = salon.opening_hours[dayOfWeek];
    
    console.log('📅 Day schedule for', dayOfWeek, ':', daySchedule);
    
    if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
      console.log('🚫 Salon closed on this day');
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
  }, [salon?.opening_hours]);

  // Carregar horários disponíveis - função corrigida
  const loadAvailableTimes = useCallback(async (date: Date) => {
    if (!salon?.id || !date) {
      console.log('❌ Missing salon ID or date');
      setAvailableTimes([]);
      return;
    }

    console.log('🔍 Loading available times for:', date.toDateString());
    setLoadingTimes(true);
    
    try {
      const dateString = date.toISOString().split('T')[0];
      
      // Gerar todos os slots possíveis primeiro
      const allSlots = generateTimeSlots(date);
      console.log('📋 All possible slots:', allSlots);
      
      if (allSlots.length === 0) {
        console.log('❌ No slots generated - salon might be closed');
        setAvailableTimes([]);
        return;
      }
      
      // Buscar agendamentos já existentes
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salon.id)
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('❌ Error fetching appointments:', error);
        // Mesmo com erro na busca, vamos mostrar todos os slots disponíveis
        console.log('⚠️ Showing all slots due to fetch error');
      }

      const bookedTimes = appointments?.map(apt => apt.appointment_time) || [];
      console.log('📅 Booked times:', bookedTimes);
      
      // Filtrar horários disponíveis
      const currentTime = new Date();
      const isToday = date.toDateString() === currentTime.toDateString();
      
      const availableSlots = allSlots.filter(slot => {
        // Se já está ocupado, não mostrar
        if (bookedTimes.includes(slot)) {
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

      console.log(`✅ Final available slots (${availableSlots.length}):`, availableSlots);
      setAvailableTimes(availableSlots);
      
    } catch (error) {
      console.error('❌ Erro ao carregar horários:', error);
      
      // Em caso de erro, gerar pelo menos os horários básicos
      const fallbackSlots = generateTimeSlots(date);
      console.log('🔄 Using fallback slots:', fallbackSlots);
      setAvailableTimes(fallbackSlots);
      
      toast({
        title: "Aviso",
        description: "Erro ao verificar agendamentos existentes. Mostrando todos os horários disponíveis.",
        variant: "default"
      });
    } finally {
      setLoadingTimes(false);
    }
  }, [salon?.id, generateTimeSlots, toast]);

  return {
    availableTimes,
    loadingTimes,
    loadAvailableTimes,
    setAvailableTimes
  };
};
