
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

  // Gerar slots de tempo baseado em horário de abertura e fechamento COM FILTRO de pausa
  const generateTimeSlots = useCallback((openTime: string, closeTime: string, lunchBreak?: any): string[] => {
    const slots: string[] = [];
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    // Gerar slots a cada 30 minutos
    for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // ✅ FILTRAR HORÁRIOS DA PAUSA PARA ALMOÇO
      if (!isInLunchBreak(timeString, lunchBreak)) {
        slots.push(timeString);
      }
    }
    
    return slots;
  }, [isInLunchBreak]);

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

    // FIX: Usar componentes locais da data para evitar problemas de timezone
    const localYear = selectedDate.getFullYear();
    const localMonth = selectedDate.getMonth() + 1;
    const localDay = selectedDate.getDate();
    const dateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
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

      // Buscar dados do salão para obter horários de funcionamento
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('opening_hours')
        .eq('id', salonId)
        .single();

      if (salonError) {
        console.error('❌ Error fetching salon data:', salonError);
        setError('Erro ao buscar dados do estabelecimento');
        setAvailableSlots([]);
        return;
      }

      if (!salonData?.opening_hours) {
        console.log('❌ No opening hours found for salon');
        setError('Horários de funcionamento não configurados');
        setAvailableSlots([]);
        return;
      }

      // Gerar horários disponíveis baseado nos horários de funcionamento COM PAUSA
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
      const daySchedule = salonData.opening_hours[dayOfWeek];

      if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
        console.log(`🚫 Salon closed on ${dayOfWeek}`);
        setAvailableSlots([]);
        setError('Estabelecimento fechado neste dia');
        return;
      }

      // Gerar todos os slots possíveis para o dia
      const allSlots = generateTimeSlots(daySchedule.open, daySchedule.close, daySchedule.lunchBreak);
      console.log('📅 Generated slots (with lunch break filter):', allSlots);

      if (allSlots.length === 0) {
        console.log('❌ No slots generated');
        setAvailableSlots([]);
        setError('Nenhum horário disponível');
        return;
      }

      // Buscar agendamentos já ocupados para esta data
      const { data: bookedAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time, service_id, services(duration_minutes)')
        .eq('salon_id', salonId)
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']);

      if (appointmentsError) {
        console.error('❌ Error fetching appointments:', appointmentsError);
        // Mesmo com erro, mostrar slots (melhor mostrar algo do que nada)
        const filteredSlots = filterPastSlots(allSlots, selectedDate);
        setAvailableSlots(filteredSlots);
        setError('Aviso: não foi possível verificar agendamentos existentes');
        return;
      }

      console.log('📅 Booked appointments:', bookedAppointments);

      // Filtrar horários disponíveis
      const availableSlots = filterAvailableSlots(allSlots, bookedAppointments || [], selectedDate, serviceId);

      console.log(`✅ Final available slots (${availableSlots.length}):`, availableSlots);
      setAvailableSlots(availableSlots);
      setError(null);

    } catch (err: any) {
      console.error('❌ Exception fetching time slots:', err);
      // Em caso de erro, fornecer horários básicos filtrados
      const fallbackSlots = generateDefaultTimeSlots(selectedDate);
      setAvailableSlots(fallbackSlots);
      setError('Usando horários padrão devido a erro');
    } finally {
      setLoading(false);
      isCurrentlyFetching.current = false;
    }
  }, [salonId, selectedDate, serviceId, generateTimeSlots]);

  // Filtrar slots disponíveis removendo conflitos
  const filterAvailableSlots = (
    allSlots: string[], 
    bookedAppointments: any[], 
    date: Date, 
    currentServiceId?: string
  ): string[] => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    return allSlots.filter(slot => {
      // Se é hoje, não mostrar horários que já passaram (com margem de 1 hora)
      if (isToday) {
        const [hour, minute] = slot.split(':').map(Number);
        const slotDateTime = new Date();
        slotDateTime.setHours(hour, minute, 0, 0);
        
        const currentTimePlusMargin = new Date(now.getTime() + 60 * 60 * 1000);
        if (slotDateTime <= currentTimePlusMargin) {
          return false;
        }
      }

      // Verificar se o slot está ocupado por algum agendamento
      for (const appointment of bookedAppointments) {
        const appointmentTime = appointment.appointment_time;
        const serviceDuration = appointment.services?.duration_minutes || 30;
        
        // Calcular o horário de fim do agendamento
        const [appHour, appMinute] = appointmentTime.split(':').map(Number);
        const appointmentStartMinutes = appHour * 60 + appMinute;
        const appointmentEndMinutes = appointmentStartMinutes + serviceDuration;
        
        // Calcular o horário do slot atual
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;
        
        // Assumir duração padrão de 30 minutos para o novo agendamento
        const newServiceDuration = 30; // Pode ser refinado baseado no serviceId
        const slotEndMinutes = slotStartMinutes + newServiceDuration;
        
        // Verificar sobreposição de horários
        if (
          (slotStartMinutes < appointmentEndMinutes) && 
          (slotEndMinutes > appointmentStartMinutes)
        ) {
          console.log(`❌ Slot ${slot} conflicts with appointment at ${appointmentTime}`);
          return false;
        }
      }
      
      return true;
    });
  };

  // Filtrar apenas horários que não passaram (para casos de erro)
  const filterPastSlots = (slots: string[], date: Date): string[] => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (!isToday) return slots;
    
    return slots.filter(slot => {
      const [hour, minute] = slot.split(':').map(Number);
      const slotDateTime = new Date();
      slotDateTime.setHours(hour, minute, 0, 0);
      
      const currentTimePlusMargin = new Date(now.getTime() + 60 * 60 * 1000);
      return slotDateTime > currentTimePlusMargin;
    });
  };

  // Gerar horários padrão em caso de erro (8:00 - 18:00)
  const generateDefaultTimeSlots = (date: Date) => {
    const slots: string[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return filterPastSlots(slots, date);
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
