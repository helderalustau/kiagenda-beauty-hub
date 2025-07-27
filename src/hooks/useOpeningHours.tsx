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

  // ✅ CORRIGIR: Normalizar dados iniciais com estrutura completa
  const normalizeInitialHours = (hours: any): OpeningHours => {
    if (!hours || typeof hours !== 'object') {
      return defaultOpeningHours;
    }

    const normalizedHours = Object.keys(defaultOpeningHours).reduce((acc, day) => {
      const dayKey = day as keyof OpeningHours;
      const existingDay = hours[dayKey];
      
      acc[dayKey] = {
        open: existingDay?.open || defaultSchedule.open,
        close: existingDay?.close || defaultSchedule.close,
        closed: existingDay?.closed ?? (dayKey === 'sunday' ? true : false),
        lunchBreak: {
          enabled: existingDay?.lunchBreak?.enabled ?? false,
          start: existingDay?.lunchBreak?.start || '12:00',
          end: existingDay?.lunchBreak?.end || '13:00'
        }
      };
      
      return acc;
    }, {} as OpeningHours);

    return normalizedHours;
  };

  const [openingHours, setOpeningHours] = useState<OpeningHours>(() => {
    console.log('useOpeningHours - Initializing with hours:', initialHours);
    return normalizeInitialHours(initialHours);
  });

  const [originalHours, setOriginalHours] = useState<OpeningHours>(openingHours);
  const [originalSpecialDates, setOriginalSpecialDates] = useState<SpecialDate[]>([]);

  // ✅ CORRIGIR: Sincronizar com props quando mudar (sem perder estado local)
  useEffect(() => {
    if (initialHours && typeof initialHours === 'object') {
      console.log('useOpeningHours - Syncing with new props:', initialHours);
      
      const normalizedHours = normalizeInitialHours(initialHours);
      
      // ✅ IMPORTANTE: Atualizar tanto o estado atual quanto o original
      setOpeningHours(normalizedHours);
      setOriginalHours(normalizedHours);
      
      // Carregar datas especiais se existirem
      if (initialHours.specialDates) {
        setSpecialDates(initialHours.specialDates);
        setOriginalSpecialDates(initialHours.specialDates);
      }
      
      // Resetar flag de mudanças quando sincronizar
      setHasChanges(false);
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
            enabled: value.enabled ?? prev[day].lunchBreak?.enabled ?? false,
            start: value.start || prev[day].lunchBreak?.start || '12:00',
            end: value.end || prev[day].lunchBreak?.end || '13:00'
          }
        };
        console.log('useOpeningHours - Updated lunch break:', updated[day].lunchBreak);
      } else {
        updated[day] = {
          ...prev[day],
          [field]: value
        };
      }
      
      console.log('useOpeningHours - New state for', day, ':', updated[day]);
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

    console.log('useOpeningHours - Saving hours for salon:', salonId, openingHours);
    setSaving(true);
    
    try {
      const dataToSave = {
        ...openingHours,
        specialDates
      };

      console.log('useOpeningHours - Data to save:', JSON.stringify(dataToSave, null, 2));

      const result = await updateSalon({
        id: salonId,
        opening_hours: dataToSave
      });

      if (result.success) {
        // ✅ CORRIGIR: Atualizar os dados originais após salvar
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
    generateTimeSlots: (openingHours: any) => {
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
        current += 30;
      }

      return slots;
    },
    parseTime: (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    },
    formatTime: (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
  };
};
