
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

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

export const useOpeningHours = (salonId: string, initialHours?: OpeningHours) => {
  const { toast } = useToast();
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    initialHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '09:00', close: '16:00', closed: true }
    }
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateDaySchedule = useCallback((day: keyof OpeningHours, field: keyof DaySchedule, value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
    setHasChanges(true);
  }, []);

  const saveOpeningHours = useCallback(async () => {
    if (!salonId || !hasChanges) return { success: true };

    setSaving(true);
    try {
      console.log('Salvando horários de funcionamento:', openingHours);

      const { error } = await supabase
        .from('salons')
        .update({ 
          opening_hours: openingHours,
          updated_at: new Date().toISOString()
        })
        .eq('id', salonId);

      if (error) {
        console.error('Erro ao salvar horários:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar horários de funcionamento",
          variant: "destructive"
        });
        return { success: false, error };
      }

      setHasChanges(false);
      toast({
        title: "Sucesso",
        description: "Horários de funcionamento salvos com sucesso",
      });

      console.log('Horários salvos com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar horários de funcionamento",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  }, [salonId, openingHours, hasChanges, toast]);

  const resetChanges = useCallback(() => {
    if (initialHours) {
      setOpeningHours(initialHours);
    }
    setHasChanges(false);
  }, [initialHours]);

  return {
    openingHours,
    hasChanges,
    saving,
    updateDaySchedule,
    saveOpeningHours,
    resetChanges
  };
};
