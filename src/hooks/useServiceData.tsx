
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service, PresetService } from './useSupabaseData';

export const useServiceData = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [presetServices, setPresetServices] = useState<PresetService[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch salon services
  const fetchSalonServices = async (salonId: string): Promise<Service[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }

      const services = data || [];
      setServices(services);
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch preset services
  const fetchPresetServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('preset_services')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching preset services:', error);
        return;
      }

      setPresetServices(data || []);
    } catch (error) {
      console.error('Error fetching preset services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: any) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        return { success: false, message: 'Erro ao criar serviço' };
      }

      return { success: true, service: data };
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, message: 'Erro ao criar serviço' };
    }
  };

  // Create services from presets
  const createServicesFromPresets = async (salonId: string, selectedServices: any[]) => {
    try {
      setLoading(true);
      
      const servicesToCreate = selectedServices.map(({ presetId, price }) => {
        const preset = presetServices.find(p => p.id === presetId);
        if (!preset) return null;
        
        return {
          salon_id: salonId,
          name: preset.name,
          description: preset.description,
          price: price,
          duration_minutes: preset.default_duration_minutes,
          active: true
        };
      }).filter(Boolean);

      const { data, error } = await supabase
        .from('services')
        .insert(servicesToCreate)
        .select();

      if (error) {
        console.error('Error creating services:', error);
        return { success: false, message: 'Erro ao criar serviços' };
      }

      return { success: true, services: data };
    } catch (error) {
      console.error('Error creating services from presets:', error);
      return { success: false, message: 'Erro ao criar serviços' };
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    presetServices,
    loading,
    fetchSalonServices,
    fetchPresetServices,
    createService,
    createServicesFromPresets,
    setServices,
    setPresetServices
  };
};
