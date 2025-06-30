
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
      return { ...defaultOpeningHours, ...initialHours };
    }
    return defaultOpeningHours;
  });

  const [originalHours, setOriginalHours] = useState<OpeningHours>(openingHours);

  useEffect(() => {
    if (initialHours && typeof initialHours === 'object') {
      const newHours = { ...defaultOpeningHours, ...initialHours };
      setOpeningHours(newHours);
      setOriginalHours(newHours);
    }
  }, [initialHours]);

  const updateDaySchedule = (day: keyof OpeningHours, field: keyof DaySchedule, value: string | boolean) => {
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
      return { success: false, message: 'ID do estabelecimento não fornecido' };
    }

    setSaving(true);
    try {
      const result = await updateSalon({
        id: salonId,
        opening_hours: openingHours
      });

      if (result.success) {
        setOriginalHours(openingHours);
        setHasChanges(false);
        toast({
          title: "✅ Horários Salvos!",
          description: "Horários de funcionamento atualizados com sucesso!"
        });
        return { success: true };
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao salvar horários",
          variant: "destructive"
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error saving opening hours:', error);
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
    setOpeningHours(originalHours);
    setHasChanges(false);
  };

  const generateTimeSlots = (openingHours: any) => {
    // Horário padrão se não houver configuração
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
          break;
        }
      }
    }

    const slots: string[] = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    let current = start;
    while (current < end) {
      slots.push(formatTime(current));
      current += 30; // Incrementar 30 minutos
    }

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
