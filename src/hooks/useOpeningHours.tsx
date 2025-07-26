import { useState, useEffect } from 'react';
import { useSalonUpdate } from '@/hooks/salon/useSalonUpdate';
import { useToast } from '@/hooks/use-toast';

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
  lunchBreak?: {
    enabled: boolean;
    start: string;
    end: string;
  };
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

interface SpecialDate {
  date: string;
  reason: string;
  closed: boolean;
  customHours?: {
    open: string;
    close: string;
  };
}

export const useOpeningHours = (salonId?: string, initialHours?: any) => {
  const { updateSalon } = useSalonUpdate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);

  const defaultSchedule: DaySchedule = {
    open: '08:00',
    close: '18:00',
    closed: false,
    lunchBreak: {
      enabled: false,
      start: '12:00',
      end: '13:00'
    }
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
      // Garantir que cada dia tenha a estrutura completa com lunchBreak
      const normalizedHours = Object.keys(defaultOpeningHours).reduce((acc, day) => {
        acc[day as keyof OpeningHours] = {
          ...defaultSchedule,
          ...initialHours[day],
          lunchBreak: {
            ...defaultSchedule.lunchBreak,
            ...initialHours[day]?.lunchBreak
          }
        };
        return acc;
      }, {} as OpeningHours);
      return normalizedHours;
    }
    return defaultOpeningHours;
  });

  const [originalHours, setOriginalHours] = useState<OpeningHours>(openingHours);
  const [originalSpecialDates, setOriginalSpecialDates] = useState<SpecialDate[]>([]);

  useEffect(() => {
    if (initialHours && typeof initialHours === 'object') {
      console.log('useOpeningHours - Updating hours from props:', initialHours);
      const normalizedHours = Object.keys(defaultOpeningHours).reduce((acc, day) => {
        acc[day as keyof OpeningHours] = {
          ...defaultSchedule,
          ...initialHours[day],
          lunchBreak: {
            ...defaultSchedule.lunchBreak,
            ...initialHours[day]?.lunchBreak
          }
        };
        return acc;
      }, {} as OpeningHours);
      
      setOpeningHours(normalizedHours);
      setOriginalHours(normalizedHours);
      
      // Carregar datas especiais se existirem
      if (initialHours.specialDates) {
        setSpecialDates(initialHours.specialDates);
        setOriginalSpecialDates(initialHours.specialDates);
      }
    }
  }, [initialHours]);

  const updateDaySchedule = (day: keyof OpeningHours, field: keyof DaySchedule | 'lunchBreak', value: any) => {
    console.log('useOpeningHours - Updating day schedule:', day, field, value);
    
    setOpeningHours(prev => {
      const updated = { ...prev };
      
      if (field === 'lunchBreak') {
        updated[day] = {
          ...prev[day],
          lunchBreak: {
            ...prev[day].lunchBreak,
            ...value
          }
        };
      } else {
        updated[day] = {
          ...prev[day],
          [field]: value
        };
      }
      
      return updated;
    });
    setHasChanges(true);
  };

  const addSpecialDate = (specialDate: SpecialDate) => {
    setSpecialDates(prev => [...prev, specialDate]);
    setHasChanges(true);
  };

  const updateSpecialDate = (index: number, updates: Partial<SpecialDate>) => {
    setSpecialDates(prev => prev.map((date, i) => 
      i === index ? { ...date, ...updates } : date
    ));
    setHasChanges(true);
  };

  const removeSpecialDate = (index: number) => {
    setSpecialDates(prev => prev.filter((_, i) => i !== index));
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
      const dataToSave = {
        ...openingHours,
        specialDates
      };

      const result = await updateSalon({
        id: salonId,
        opening_hours: dataToSave
      });

      if (result.success) {
        setOriginalHours(openingHours);
        setOriginalSpecialDates(specialDates);
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
    setSpecialDates(originalSpecialDates);
    setHasChanges(false);
  };

  const generateTimeSlots = (openingHours: any) => {
    console.log('useOpeningHours - Generating time slots for:', openingHours);
    
    const defaultHours = {
      start: '08:00',
      end: '18:00'
    };

    let startTime = defaultHours.start;
    let endTime = defaultHours.end;

    if (openingHours && typeof openingHours === 'object') {
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
      current += 30;
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
    specialDates,
    hasChanges,
    saving,
    updateDaySchedule,
    addSpecialDate,
    updateSpecialDate,
    removeSpecialDate,
    saveOpeningHours,
    resetChanges,
    generateTimeSlots,
    parseTime,
    formatTime
  };
};
