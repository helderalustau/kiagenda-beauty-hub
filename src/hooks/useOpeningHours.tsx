
import { useState, useEffect } from 'react';
import { useSalonUpdate } from '@/hooks/salon/useSalonUpdate';
import { useToast } from '@/hooks/use-toast';

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export const useOpeningHours = (salonId?: string, initialHours?: any) => {
  const { updateSalon } = useSalonUpdate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const defaultSchedule: DaySchedule = {
    open: '08:00',
    close: '18:00',
    closed: false
  };

  const defaultOpeningHours: OpeningHours = {
    monday: { ...defaultSchedule },
    tuesday: { ...defaultSchedule },
    wednesday: { ...defaultSchedule },
    thursday: { ...defaultSchedule },
    friday: { ...defaultSchedule },
    saturday: { ...defaultSchedule },
    sunday: { ...defaultSchedule, closed: true }
  };

  const [openingHours, setOpeningHours] = useState<OpeningHours>(() => {
    if (initialHours && typeof initialHours === 'object') {
      console.log('useOpeningHours - Initializing with hours:', initialHours);
      return { ...defaultOpeningHours, ...initialHours };
    }
    return defaultOpeningHours;
  });

  const [originalHours, setOriginalHours] = useState<OpeningHours>(openingHours);

  useEffect(() => {
    if (initialHours && typeof initialHours === 'object') {
      console.log('useOpeningHours - Updating hours from props:', initialHours);
      const newHours = { ...defaultOpeningHours, ...initialHours };
      setOpeningHours(newHours);
      setOriginalHours(newHours);
    }
  }, [initialHours]);

  const updateDaySchedule = (day: keyof OpeningHours, field: keyof DaySchedule, value: string | boolean) => {
    console.log('useOpeningHours - Updating day schedule:', day, field, value);
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const saveOpeningHours = async () => {
    if (!salonId) {
      console.error('useOpeningHours - No salon ID provided');
      return { success: false, message: 'ID do estabelecimento não fornecido' };
    }

    console.log('useOpeningHours - Saving hours for salon:', salonId);
    setSaving(true);
    
    try {
      const result = await updateSalon({
        id: salonId,
        opening_hours: openingHours
      });

      if (result.success) {
        setOriginalHours(openingHours);
        setHasChanges(false);
        console.log('useOpeningHours - Hours saved successfully');
        toast({
          title: "✅ Horários Salvos!",
          description: "Horários de funcionamento atualizados com sucesso!"
        });
        return { success: true };
      } else {
        console.error('useOpeningHours - Error saving hours:', result.message);
        toast({
          title: "Erro",
          description: result.message || "Erro ao salvar horários",
          variant: "destructive"
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('useOpeningHours - Exception saving hours:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao salvar horários",
        variant: "destructive"
      });
      return { success: false, message: "Erro interno" };
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    console.log('useOpeningHours - Resetting changes');
    setOpeningHours(originalHours);
    setHasChanges(false);
  };

  const generateTimeSlots = (openingHours: any) => {
    console.log('useOpeningHours - Generating time slots for:', openingHours);
    
    // Horário padrão se não houver configuração válida
    const defaultHours = {
      start: '08:00',
      end: '18:00'
    };

    // Extrair horários (assumindo que openingHours tem formato similar)
    let startTime = defaultHours.start;
    let endTime = defaultHours.end;

    if (openingHours && typeof openingHours === 'object') {
      // Tentar extrair horários do primeiro dia disponível
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        if (openingHours[day] && !openingHours[day].closed) {
          startTime = openingHours[day].open || startTime;
          endTime = openingHours[day].close || endTime;
          console.log(`useOpeningHours - Using ${day} schedule: ${startTime} - ${endTime}`);
          break;
        }
      }
    }

    const slots: string[] = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    console.log(`useOpeningHours - Generating slots from ${startTime} (${start}min) to ${endTime} (${end}min)`);

    let current = start;
    while (current < end) {
      slots.push(formatTime(current));
      current += 30; // Incrementar 30 minutos
    }

    console.log(`useOpeningHours - Generated ${slots.length} time slots:`, slots);
    return slots;
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return {
    openingHours,
    hasChanges,
    saving,
    updateDaySchedule,
    saveOpeningHours,
    resetChanges,
    generateTimeSlots,
    parseTime,
    formatTime
  };
};
