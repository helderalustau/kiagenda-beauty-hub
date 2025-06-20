
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
      console.log('Fetching services for salon:', salonId);
      
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

      console.log('Services fetched successfully:', data);
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

      console.log('Preset services fetched:', data?.length);
      setPresetServices(data || []);
    } catch (error) {
      console.error('Error fetching preset services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: any) => {
    try {
      console.log('Creating service:', serviceData);
      
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        return { success: false, message: 'Erro ao criar serviço: ' + error.message };
      }

      console.log('Service created successfully:', data);
      return { success: true, service: data };
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, message: 'Erro ao criar serviço' };
    }
  };

  // Create services from presets - Fixed to handle proper data structure
  const createServicesFromPresets = async (salonId: string, selectedServices: any[]) => {
    try {
      setLoading(true);
      console.log('Creating services from presets for salon:', salonId);
      console.log('Selected services data:', selectedServices);
      
      if (!selectedServices || selectedServices.length === 0) {
        console.log('No services selected');
        return { success: true, services: [] };
      }
      
      // Buscar os preset services se ainda não estão carregados
      if (presetServices.length === 0) {
        await fetchPresetServices();
      }
      
      const servicesToCreate = selectedServices.map(({ id, price }) => {
        const preset = presetServices.find(p => p.id === id);
        if (!preset) {
          console.warn(`Preset service not found for ID: ${id}`);
          return null;
        }
        
        const numericPrice = parseFloat(price.toString());
        if (!numericPrice || numericPrice <= 0) {
          console.warn(`Invalid price for service ${preset.name}: ${price}`);
          return null;
        }
        
        return {
          salon_id: salonId,
          name: preset.name,
          description: preset.description || null,
          price: numericPrice,
          duration_minutes: preset.default_duration_minutes || 60,
          active: true
        };
      }).filter(Boolean);

      if (servicesToCreate.length === 0) {
        console.log('No valid services to create');
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
      
      // Atualizar lista local de serviços
      if (data && data.length > 0) {
        setServices(prev => [...prev, ...data]);
      }
      
      return { success: true, services: data };
    } catch (error) {
      console.error('Error creating services from presets:', error);
      return { success: false, message: 'Erro ao criar serviços' };
    } finally {
      setLoading(false);
    }
  };

  // Update service
  const updateService = async (serviceId: string, updateData: Partial<Service>) => {
    try {
      console.log('Updating service:', serviceId, updateData);
      
      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        console.error('Error updating service:', error);
        return { success: false, message: 'Erro ao atualizar serviço: ' + error.message };
      }

      console.log('Service updated successfully:', data);
      
      // Atualizar lista local
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...data } : service
      ));
      
      return { success: true, service: data };
    } catch (error) {
      console.error('Error updating service:', error);
      return { success: false, message: 'Erro ao atualizar serviço' };
    }
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    try {
      console.log('Deleting service:', serviceId);
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        return { success: false, message: 'Erro ao excluir serviço: ' + error.message };
      }

      console.log('Service deleted successfully');
      
      // Remover da lista local
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting service:', error);
      return { success: false, message: 'Erro ao excluir serviço' };
    }
  };

  // Toggle service status
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    return await updateService(serviceId, { active: !currentStatus });
  };

  return {
    services,
    presetServices,
    loading,
    fetchSalonServices,
    fetchPresetServices,
    createService,
    createServicesFromPresets,
    updateService,
    deleteService,
    toggleServiceStatus,
    setServices,
    setPresetServices
  };
};
