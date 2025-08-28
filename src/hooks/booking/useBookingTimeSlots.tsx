
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/hooks/useSupabaseData';

export const useBookingTimeSlots = (salon: Salon) => {
  const { toast } = useToast();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Função para verificar se o horário está dentro da pausa para almoço
  const isInLunchBreak = useCallback((time: string, lunchBreak: any) => {
    if (!lunchBreak?.enabled || !lunchBreak?.start || !lunchBreak?.end) {
      return false;
    }

    const [timeHour, timeMinute] = time.split(':').map(Number);
    const [startHour, startMinute] = lunchBreak.start.split(':').map(Number);
    const [endHour, endMinute] = lunchBreak.end.split(':').map(Number);

    const timeInMinutes = timeHour * 60 + timeMinute;
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  }, []);

  // Gerar horários disponíveis - função melhorada com filtro de pausa para almoço
  const generateTimeSlots = useCallback((date: Date) => {
    console.log('🕒 Generating time slots for:', date.toDateString(), 'salon:', salon?.name);
    
    if (!date) {
      console.log('❌ Missing date for time slots');
      return [];
    }

    // Se não temos opening_hours, usar horários padrão
    if (!salon?.opening_hours) {
      console.log('⚠️ No opening hours found, using default schedule');
      return generateDefaultSlots(date);
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
      
      // ✅ FILTRAR HORÁRIOS DA PAUSA PARA ALMOÇO
      if (!isInLunchBreak(timeString, daySchedule.lunchBreak)) {
        slots.push(timeString);
      } else {
        console.log(`🍽️ Slot ${timeString} removed - lunch break`);
      }
    }
    
    console.log(`✅ Generated ${slots.length} time slots (after lunch break filter):`, slots);
    return slots;
  }, [salon?.opening_hours, salon?.name, isInLunchBreak]);

  // Gerar horários padrão (8:00 - 18:00)
  const generateDefaultSlots = (date: Date) => {
    const slots: string[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  // Carregar horários disponíveis - função simplificada e robusta
  const loadAvailableTimes = useCallback(async (date: Date) => {
    if (!salon?.id || !date) {
      console.log('❌ Missing salon ID or date for loadAvailableTimes');
      setAvailableTimes([]);
      return;
    }

    console.log('🔍 Loading available times for:', date.toDateString(), 'salon:', salon.name);
    setLoadingTimes(true);
    
    try {
      // FIX: Usar componentes locais da data para evitar problemas de timezone
      const localYear = date.getFullYear();
      const localMonth = date.getMonth() + 1;
      const localDay = date.getDate();
      const dateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
      
      // Gerar todos os slots possíveis primeiro
      const allSlots = generateTimeSlots(date);
      console.log('📋 All possible slots:', allSlots);
      
      if (allSlots.length === 0) {
        console.log('❌ No slots generated - salon might be closed');
        setAvailableTimes([]);
        return;
      }
      
      // Buscar agendamentos já existentes (incluindo notes para serviços adicionais)
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_time, notes, services(duration_minutes)')
        .eq('salon_id', salon.id)
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('❌ Error fetching appointments:', error);
        // Mesmo com erro na busca, vamos mostrar todos os slots disponíveis
        console.log('⚠️ Showing all slots due to fetch error');
      }

      // Função para extrair serviços adicionais das notas
      const parseAdditionalServices = (notes: string): { duration: number }[] => {
        if (!notes) return [];
        
        const additionalServicesMatch = notes.match(/Serviços Adicionais:\s*(.+?)(?:\n\n|$)/s);
        if (!additionalServicesMatch) return [];
        
        const servicesText = additionalServicesMatch[1];
        const serviceMatches = servicesText.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/g);
        
        if (!serviceMatches) return [];
        
        return serviceMatches.map(match => {
          const parts = match.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/);
          if (!parts) return null;
          
          return {
            duration: parseInt(parts[2])
          };
        }).filter(Boolean) as { duration: number }[];
      };

      // Calcular duração total de cada agendamento
      const calculateTotalDuration = (appointment: any): number => {
        const mainServiceDuration = appointment.services?.duration_minutes || 30;
        const additionalServices = parseAdditionalServices(appointment.notes || '');
        const additionalDuration = additionalServices.reduce((sum, service) => sum + service.duration, 0);
        
        return mainServiceDuration + additionalDuration;
      };

      // Criar lista de slots ocupados baseada na duração total
      const occupiedSlots = new Set<string>();
      
      appointments?.forEach(appointment => {
        const startTime = appointment.appointment_time;
        const totalDuration = calculateTotalDuration(appointment);
        
        console.log(`📅 Appointment at ${startTime} with total duration: ${totalDuration}min`);
        
        // Marcar todos os slots de 30min ocupados por este agendamento
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = startTimeInMinutes + totalDuration;
        
        // Marcar slots em intervalos de 30 minutos
        for (let time = startTimeInMinutes; time < endTimeInMinutes; time += 30) {
          const hour = Math.floor(time / 60);
          const minute = time % 60;
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          occupiedSlots.add(timeString);
          console.log(`🚫 Blocking slot: ${timeString}`);
        }
      });
      
      console.log('📅 Total occupied slots:', Array.from(occupiedSlots));
      
      // Filtrar horários disponíveis
      const currentTime = new Date();
      const isToday = date.toDateString() === currentTime.toDateString();
      
      const availableSlots = allSlots.filter(slot => {
        // Se está ocupado, não mostrar
        if (occupiedSlots.has(slot)) {
          console.log(`❌ Slot ${slot} is occupied`);
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
  }, [salon?.id, salon?.name, generateTimeSlots, toast]);

  return {
    availableTimes,
    loadingTimes,
    loadAvailableTimes,
    setAvailableTimes
  };
};
