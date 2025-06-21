
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service, PresetService } from '@/types/supabase-entities';

export const useServiceFetch = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [presetServices, setPresetServices] = useState<PresetService[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch salon services with better error handling
  const fetchSalonServices = async (salonId: string): Promise<Service[]> => {
    try {
      setLoading(true);
      console.log('useServiceFetch - Fetching services for salon ID:', salonId);
      
      if (!salonId) {
        console.error('useServiceFetch - Salon ID is required');
        return [];
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .order('name');

      if (error) {
        console.error('useServiceFetch - Error fetching services:', error);
        throw error;
      }

      console.log('useServiceFetch - Services fetched successfully:', data?.length || 0, 'services');
      const fetchedServices = data || [];
      setServices(fetchedServices);
      return fetchedServices;
    } catch (error) {
      console.error('useServiceFetch - Error in fetchSalonServices:', error);
      setServices([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch preset services
  const fetchPresetServices = async (): Promise<PresetService[]> => {
    try {
      setLoading(true);
      console.log('useServiceFetch - Fetching preset services...');
      
      const { data, error } = await supabase
        .from('preset_services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('useServiceFetch - Error fetching preset services:', error);
        throw error;
      }

      console.log('useServiceFetch - Preset services fetched:', data?.length || 0, 'presets');
      const fetchedPresets = data || [];
      setPresetServices(fetchedPresets);
      return fetchedPresets;
    } catch (error) {
      console.error('useServiceFetch - Error in fetchPresetServices:', error);
      setPresetServices([]);
      return [];
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
    setServices,
    setPresetServices
  };
};
