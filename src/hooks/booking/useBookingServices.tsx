
import { useEffect, useCallback } from 'react';
import { useServiceData } from '@/hooks/useServiceData';
import { useToast } from "@/components/ui/use-toast";
import { Salon } from '@/hooks/useSupabaseData';

export const useBookingServices = (salon: Salon) => {
  const { toast } = useToast();
  const { services, fetchSalonServices, loading: servicesLoading } = useServiceData();

  const loadSalonServices = useCallback(async () => {
    if (!salon?.id) {
      console.error('No salon ID provided');
      return;
    }
    
    try {
      console.log('Loading services for salon:', salon.id);
      const salonServices = await fetchSalonServices(salon.id);
      console.log('Services loaded:', salonServices?.length || 0, 'services');
      
      if (!salonServices || salonServices.length === 0) {
        console.warn('No services found for salon:', salon.id);
        toast({
          title: "Aviso",
          description: "Este estabelecimento ainda não possui serviços cadastrados.",
          variant: "default"
        });
      } else {
        const activeServices = salonServices.filter(service => service.active === true);
        console.log('Active services:', activeServices);
        
        if (activeServices.length === 0) {
          toast({
            title: "Aviso",
            description: "Este estabelecimento não possui serviços ativos no momento.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Error loading salon services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços do estabelecimento",
        variant: "destructive"
      });
    }
  }, [salon?.id, fetchSalonServices, toast]);

  return {
    services,
    loadingServices: servicesLoading,
    loadSalonServices
  };
};
