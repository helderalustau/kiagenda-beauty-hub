
import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/hooks/useSupabaseData';

export const useBookingServices = (salonId: string) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const loadServices = useCallback(async () => {
    if (!salonId) {
      console.log('useBookingServices - No salon ID provided');
      return;
    }
    
    setLoadingServices(true);
    console.log('useBookingServices - Loading services for salon:', salonId);
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('useBookingServices - Error loading services:', error);
        throw error;
      }

      console.log('useBookingServices - Services loaded:', data?.length || 0, 'services');
      console.log('useBookingServices - Services data:', data);
      
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços",
        variant: "destructive"
      });
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [salonId, toast]);

  // Carregar serviços automaticamente quando o salonId muda
  useEffect(() => {
    if (salonId) {
      loadServices();
    }
  }, [salonId, loadServices]);

  // Compatibility alias for existing modal hooks
  const loadSalonServices = loadServices;

  return {
    services,
    loadingServices,
    loadServices,
    loadSalonServices // Compatibility alias
  };
};
