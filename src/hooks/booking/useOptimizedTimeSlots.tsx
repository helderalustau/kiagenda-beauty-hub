
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

  // Buscar agendamentos com duração total
  const fetchBookedAppointments = useCallback(async (salonId: string, date: string): Promise<any[]> => {
    try {
      console.log(`🔍 Fetching booked appointments for salon ${salonId} on ${date}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time, notes, services(duration_minutes)')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_time');

      if (error) {
        console.error('❌ Error fetching booked appointments:', error);
        return [];
      }

      console.log(`📅 Found ${data?.length || 0} booked appointments:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ Error in fetchBookedAppointments:', error);
      return [];
    }
  }, []);

  // Função para extrair serviços adicionais das notas
  const parseAdditionalServices = useCallback((notes: string): { duration: number }[] => {
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
  }, []);

  // Calcular duração total de um agendamento
  const calculateTotalDuration = useCallback((appointment: any): number => {
    const mainServiceDuration = appointment.services?.duration_minutes || 30;
    const additionalServices = parseAdditionalServices(appointment.notes || '');
    const additionalDuration = additionalServices.reduce((sum, service) => sum + service.duration, 0);
    
    return mainServiceDuration + additionalDuration;
  }, [parseAdditionalServices]);

  // Filtrar slots disponíveis baseado na duração total dos agendamentos
  const filterAvailableSlots = useCallback((allSlots: string[], bookedAppointments: any[], date: Date) => {
    const currentTime = new Date();
    const isToday = date.toDateString() === currentTime.toDateString();
    
    // Criar conjunto de slots ocupados baseado na duração total
    const occupiedSlots = new Set<string>();
    
    bookedAppointments.forEach(appointment => {
      const startTime = appointment.appointment_time;
      const totalDuration = calculateTotalDuration(appointment);
      
      console.log(`📅 Processing appointment at ${startTime} with total duration: ${totalDuration}min`);
      
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
      }
    });
    
    return allSlots.filter(slot => {
      // Se está ocupado, não disponibilizar
      if (occupiedSlots.has(slot)) {
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
  }, [calculateTotalDuration]);

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
      
      // Buscar agendamentos ocupados
      // FIX: Usar componentes locais da data para evitar problemas de timezone
      const localYear = selectedDate.getFullYear();
      const localMonth = selectedDate.getMonth() + 1;
      const localDay = selectedDate.getDate();
      const dateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
      const bookedAppointments = await fetchBookedAppointments(salon.id, dateString);
      
      // Filtrar slots disponíveis
      const availableSlots = filterAvailableSlots(allSlots, bookedAppointments, selectedDate);
      
      console.log(`✅ Final available slots (${availableSlots.length}):`, availableSlots);
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [salon?.id, salon?.opening_hours, selectedDate, generateTimeSlots, fetchBookedAppointments, filterAvailableSlots]);

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
