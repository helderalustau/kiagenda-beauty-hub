
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/hooks/useSupabaseData';

export const useBookingServices = (salonId: string) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoizar salon ID para evitar re-renders desnecessários
  const memoizedSalonId = useMemo(() => salonId, [salonId]);

  const loadServices = useCallback(async () => {
    if (!memoizedSalonId) {
      console.log('useBookingServices - No salon ID provided');
      setServices([]);
      return;
    }
    
    setLoadingServices(true);
    setError(null);
    console.log('useBookingServices - Loading services for salon:', memoizedSalonId);
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', memoizedSalonId)
        .eq('active', true) // Apenas serviços ativos
        .order('name');

      if (error) {
        console.error('useBookingServices - Error loading services:', error);
        throw error;
      }

      console.log('useBookingServices - Services loaded:', data?.length || 0, 'services');
      console.log('useBookingServices - Services data:', data);
      
      const activeServices = (data || []).filter(service => service.active === true);
      console.log('useBookingServices - Active services filtered:', activeServices.length);
      
      setServices(activeServices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar serviços';
      console.error('Erro ao carregar serviços:', error);
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços do estabelecimento",
        variant: "destructive"
      });
      
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [memoizedSalonId, toast]);

  // Carregar serviços automaticamente quando o salonId muda
  useEffect(() => {
    if (memoizedSalonId) {
      console.log('useBookingServices - Auto-loading services for salon change:', memoizedSalonId);
      loadServices();
    }
  }, [memoizedSalonId, loadServices]);

  // Compatibility alias for existing modal hooks
  const loadSalonServices = loadServices;

  return {
    services,
    loadingServices,
    error,
    loadServices,
    loadSalonServices, // Compatibility alias
    refreshServices: loadServices
  };
};
