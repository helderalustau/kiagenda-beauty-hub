
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

  // Create services from presets - Fixed to use correct ID mapping
  const createServicesFromPresets = async (salonId: string, selectedServices: any[]) => {
    try {
      setLoading(true);
      
      if (!selectedServices || selectedServices.length === 0) {
        return { success: true, services: [] };
      }
      
      const servicesToCreate = selectedServices.map(({ id, price }) => {
        const preset = presetServices.find(p => p.id === id);
        if (!preset) {
          console.warn(`Preset service not found for ID: ${id}`);
          return null;
        }
        
        if (!price || price <= 0) {
          console.warn(`Invalid price for service ${preset.name}: ${price}`);
          return null;
        }
        
        return {
          salon_id: salonId,
          name: preset.name,
          description: preset.description || null,
          price: parseFloat(price.toString()),
          duration_minutes: preset.default_duration_minutes || 60,
          active: true
        };
      }).filter(Boolean);

      if (servicesToCreate.length === 0) {
        return { success: true, services: [] };
      }

      console.log('Creating services:', servicesToCreate);

      const { data, error } = await supabase
        .from('services')
        .insert(servicesToCreate)
        .select();

      if (error) {
        console.error('Error creating services:', error);
        return { success: false, message: 'Erro ao criar serviços: ' + error.message };
      }

      console.log('Services created successfully:', data);
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
