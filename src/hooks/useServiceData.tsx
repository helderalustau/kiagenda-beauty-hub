
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
      console.log('Fetching services for salon ID:', salonId);
      
      if (!salonId) {
        console.error('Salon ID is required');
        return [];
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      console.log('Services fetched successfully:', data?.length || 0, 'services');
      const fetchedServices = data || [];
      setServices(fetchedServices);
      return fetchedServices;
    } catch (error) {
      console.error('Error in fetchSalonServices:', error);
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
      console.log('Fetching preset services...');
      
      const { data, error } = await supabase
        .from('preset_services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching preset services:', error);
        throw error;
      }

      console.log('Preset services fetched:', data?.length || 0, 'presets');
      const fetchedPresets = data || [];
      setPresetServices(fetchedPresets);
      return fetchedPresets;
    } catch (error) {
      console.error('Error in fetchPresetServices:', error);
      setPresetServices([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a single service - CORRIGIDO
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating service with data:', serviceData);
      
      // Validate required fields - VALIDAÇÃO RIGOROSA
      if (!serviceData.salon_id || !serviceData.name?.trim() || !serviceData.price || serviceData.price <= 0) {
        const missingFields = [];
        if (!serviceData.salon_id) missingFields.push('salon_id');
        if (!serviceData.name?.trim()) missingFields.push('nome');
        if (!serviceData.price || serviceData.price <= 0) missingFields.push('preço válido');
        
        throw new Error(`Campos obrigatórios faltando ou inválidos: ${missingFields.join(', ')}`);
      }

      // Preparar dados com validação
      const insertData = {
        salon_id: serviceData.salon_id,
        name: serviceData.name.trim(),
        description: serviceData.description?.trim() || null,
        price: Number(serviceData.price),
        duration_minutes: Number(serviceData.duration_minutes) || 60,
        active: serviceData.active !== false
      };

      console.log('Inserting service data:', insertData);

      const { data, error } = await supabase
        .from('services')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error creating service:', error);
        throw error;
      }

      console.log('Service created successfully:', data);
      
      // Update local state
      setServices(prev => [...prev, data]);
      
      return { success: true, service: data };
    } catch (error) {
      console.error('Error in createService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar serviço'
      };
    }
  };

  // Create services from presets - VERSÃO CORRIGIDA E MELHORADA
  const createServicesFromPresets = async (salonId: string, selectedServices: { id: string; price: number }[]) => {
    try {
      setLoading(true);
      console.log('Creating services from presets for salon:', salonId);
      console.log('Selected services:', selectedServices);
      
      // Validação inicial
      if (!salonId || !selectedServices || selectedServices.length === 0) {
        console.log('No services to create - missing data');
        return { success: true, services: [] };
      }
      
      // Fetch preset services if not loaded
      let currentPresets = presetServices;
      if (currentPresets.length === 0) {
        console.log('Loading preset services...');
        currentPresets = await fetchPresetServices();
      }
      
      // Prepare services to create - VALIDAÇÃO RIGOROSA
      const servicesToCreate = [];
      const invalidServices = [];
      
      for (const { id, price } of selectedServices) {
        const preset = currentPresets.find(p => p.id === id);
        if (!preset) {
          console.warn(`Preset service not found for ID: ${id}`);
          invalidServices.push(`Serviço com ID ${id} não encontrado`);
          continue;
        }
        
        const numericPrice = Number(price);
        if (!numericPrice || numericPrice <= 0) {
          console.warn(`Invalid price for service ${preset.name}: ${price}`);
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

      // Reportar serviços inválidos
      if (invalidServices.length > 0) {
        console.warn('Invalid services found:', invalidServices);
      }

      if (servicesToCreate.length === 0) {
        console.log('No valid services to create after validation');
        return { 
          success: false, 
          message: invalidServices.length > 0 
            ? `Nenhum serviço válido para criar. Problemas: ${invalidServices.join(', ')}`
            : 'Nenhum serviço válido para criar'
        };
      }

      console.log('Valid services to create:', servicesToCreate.length);
      console.log('Services data:', servicesToCreate);

      // Insert all services at once
      const { data, error } = await supabase
        .from('services')
        .insert(servicesToCreate)
        .select();

      if (error) {
        console.error('Database error creating services:', error);
        throw error;
      }

      console.log('Services created successfully:', data?.length || 0, 'services created');
      
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
      console.error('Error in createServicesFromPresets:', error);
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
      console.log('Updating service:', serviceId, updateData);
      
      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        console.error('Error updating service:', error);
        throw error;
      }

      console.log('Service updated successfully:', data);
      
      // Update local state
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...data } : service
      ));
      
      return { success: true, service: data };
    } catch (error) {
      console.error('Error in updateService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao atualizar serviço'
      };
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
        throw error;
      }

      console.log('Service deleted successfully');
      
      // Update local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir serviço'
      };
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
