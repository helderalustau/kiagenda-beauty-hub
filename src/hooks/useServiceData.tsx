
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service, PresetService } from '@/types/supabase-entities';

export const useServiceData = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [presetServices, setPresetServices] = useState<PresetService[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch salon services with better error handling
  const fetchSalonServices = async (salonId: string): Promise<Service[]> => {
    try {
      setLoading(true);
      console.log('useServiceData - Fetching services for salon ID:', salonId);
      
      if (!salonId) {
        console.error('useServiceData - Salon ID is required');
        return [];
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .order('name');

      if (error) {
        console.error('useServiceData - Error fetching services:', error);
        throw error;
      }

      console.log('useServiceData - Services fetched successfully:', data?.length || 0, 'services');
      const fetchedServices = data || [];
      setServices(fetchedServices);
      return fetchedServices;
    } catch (error) {
      console.error('useServiceData - Error in fetchSalonServices:', error);
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
      console.log('useServiceData - Fetching preset services...');
      
      const { data, error } = await supabase
        .from('preset_services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('useServiceData - Error fetching preset services:', error);
        throw error;
      }

      console.log('useServiceData - Preset services fetched:', data?.length || 0, 'presets');
      const fetchedPresets = data || [];
      setPresetServices(fetchedPresets);
      return fetchedPresets;
    } catch (error) {
      console.error('useServiceData - Error in fetchPresetServices:', error);
      setPresetServices([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a single service
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useServiceData - Creating service with data:', serviceData);
      
      // Validate required fields
      if (!serviceData.salon_id || !serviceData.name?.trim() || !serviceData.price || serviceData.price <= 0) {
        const missingFields = [];
        if (!serviceData.salon_id) missingFields.push('salon_id');
        if (!serviceData.name?.trim()) missingFields.push('nome');
        if (!serviceData.price || serviceData.price <= 0) missingFields.push('preço válido');
        
        throw new Error(`Campos obrigatórios faltando ou inválidos: ${missingFields.join(', ')}`);
      }

      // Prepare data with validation
      const insertData = {
        salon_id: serviceData.salon_id,
        name: serviceData.name.trim(),
        description: serviceData.description?.trim() || null,
        price: Number(serviceData.price),
        duration_minutes: Number(serviceData.duration_minutes) || 60,
        active: serviceData.active !== false
      };

      console.log('useServiceData - Inserting service data:', insertData);

      const { data, error } = await supabase
        .from('services')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('useServiceData - Database error creating service:', error);
        throw error;
      }

      console.log('useServiceData - Service created successfully:', data);
      
      // Update local state immediately
      setServices(prev => [...prev, data]);
      
      return { success: true, service: data };
    } catch (error) {
      console.error('useServiceData - Error in createService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar serviço'
      };
    }
  };

  // Create services from presets
  const createServicesFromPresets = async (salonId: string, selectedServices: { id: string; price: number }[]) => {
    try {
      setLoading(true);
      console.log('useServiceData - Creating services from presets for salon:', salonId);
      console.log('useServiceData - Selected services:', selectedServices);
      
      // Initial validation
      if (!salonId || !selectedServices || selectedServices.length === 0) {
        console.log('useServiceData - No services to create - missing data');
        return { success: true, services: [] };
      }
      
      // Fetch preset services if not loaded
      let currentPresets = presetServices;
      if (currentPresets.length === 0) {
        console.log('useServiceData - Loading preset services...');
        currentPresets = await fetchPresetServices();
      }
      
      // Prepare services to create with strict validation
      const servicesToCreate = [];
      const invalidServices = [];
      
      for (const { id, price } of selectedServices) {
        const preset = currentPresets.find(p => p.id === id);
        if (!preset) {
          console.warn(`useServiceData - Preset service not found for ID: ${id}`);
          invalidServices.push(`Serviço com ID ${id} não encontrado`);
          continue;
        }
        
        const numericPrice = Number(price);
        if (!numericPrice || numericPrice <= 0) {
          console.warn(`useServiceData - Invalid price for service ${preset.name}: ${price}`);
          invalidServices.push(`Preço inválido para ${preset.name}: R$ ${price}`);
          continue;
        }
        
        servicesToCreate.push({
          salon_id: salonId,
          name: preset.name,
          description: preset.description || null,
          price: numericPrice,
          duration_minutes: preset.default_duration_minutes || 60,
          active: true
        });
      }

      // Report invalid services
      if (invalidServices.length > 0) {
        console.warn('useServiceData - Invalid services found:', invalidServices);
      }

      if (servicesToCreate.length === 0) {
        console.log('useServiceData - No valid services to create after validation');
        return { 
          success: false, 
          message: invalidServices.length > 0 
            ? `Nenhum serviço válido para criar. Problemas: ${invalidServices.join(', ')}`
            : 'Nenhum serviço válido para criar'
        };
      }

      console.log('useServiceData - Valid services to create:', servicesToCreate.length);
      console.log('useServiceData - Services data:', servicesToCreate);

      // Insert all services at once
      const { data, error } = await supabase
        .from('services')
        .insert(servicesToCreate)
        .select();

      if (error) {
        console.error('useServiceData - Database error creating services:', error);
        throw error;
      }

      console.log('useServiceData - Services created successfully:', data?.length || 0, 'services created');
      
      // Update local state
      if (data && data.length > 0) {
        setServices(prev => [...prev, ...data]);
      }
      
      return { 
        success: true, 
        services: data || [],
        message: `${data?.length || 0} serviços criados com sucesso`
      };
    } catch (error) {
      console.error('useServiceData - Error in createServicesFromPresets:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar serviços'
      };
    } finally {
      setLoading(false);
    }
  };

  // Update service
  const updateService = async (serviceId: string, updateData: Partial<Service>) => {
    try {
      console.log('useServiceData - Updating service:', serviceId, updateData);
      
      if (!serviceId) {
        throw new Error('ID do serviço é obrigatório');
      }

      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        console.error('useServiceData - Error updating service:', error);
        throw error;
      }

      console.log('useServiceData - Service updated successfully:', data);
      
      // Update local state immediately
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...data } : service
      ));
      
      return { success: true, service: data };
    } catch (error) {
      console.error('useServiceData - Error in updateService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao atualizar serviço'
      };
    }
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    try {
      console.log('useServiceData - Deleting service:', serviceId);
      
      if (!serviceId) {
        throw new Error('ID do serviço é obrigatório');
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('useServiceData - Error deleting service:', error);
        throw error;
      }

      console.log('useServiceData - Service deleted successfully');
      
      // Update local state immediately - remove from UI
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      return { success: true };
    } catch (error) {
      console.error('useServiceData - Error in deleteService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir serviço'
      };
    }
  };

  // Toggle service status
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    const result = await updateService(serviceId, { active: !currentStatus });
    
    if (result.success) {
      // Update local state immediately
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, active: !currentStatus } : service
      ));
    }
    
    return result;
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
