
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PresetService } from '@/types/supabase-entities';

export const useServicePresets = () => {
  const [loading, setLoading] = useState(false);

  // Create services from presets
  const createServicesFromPresets = async (
    salonId: string, 
    selectedServices: { id: string; price: number }[],
    presetServices: PresetService[]
  ) => {
    try {
      setLoading(true);
      console.log('useServicePresets - Creating services from presets for salon:', salonId);
      console.log('useServicePresets - Selected services:', selectedServices);
      
      // Initial validation
      if (!salonId || !selectedServices || selectedServices.length === 0) {
        console.log('useServicePresets - No services to create - missing data');
        return { success: true, services: [] };
      }
      
      // Prepare services to create with strict validation
      const servicesToCreate = [];
      const invalidServices = [];
      
      for (const { id, price } of selectedServices) {
        const preset = presetServices.find(p => p.id === id);
        if (!preset) {
          console.warn(`useServicePresets - Preset service not found for ID: ${id}`);
          invalidServices.push(`Serviço com ID ${id} não encontrado`);
          continue;
        }
        
        const numericPrice = Number(price);
        if (!numericPrice || numericPrice <= 0) {
          console.warn(`useServicePresets - Invalid price for service ${preset.name}: ${price}`);
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
        console.warn('useServicePresets - Invalid services found:', invalidServices);
      }

      if (servicesToCreate.length === 0) {
        console.log('useServicePresets - No valid services to create after validation');
        return { 
          success: false, 
          message: invalidServices.length > 0 
            ? `Nenhum serviço válido para criar. Problemas: ${invalidServices.join(', ')}`
            : 'Nenhum serviço válido para criar'
        };
      }

      console.log('useServicePresets - Valid services to create:', servicesToCreate.length);
      console.log('useServicePresets - Services data:', servicesToCreate);

      // Insert all services at once
      const { data, error } = await supabase
        .from('services')
        .insert(servicesToCreate)
        .select();

      if (error) {
        console.error('useServicePresets - Database error creating services:', error);
        throw error;
      }

      console.log('useServicePresets - Services created successfully:', data?.length || 0, 'services created');
      
      return { 
        success: true, 
        services: data || [],
        message: `${data?.length || 0} serviços criados com sucesso`
      };
    } catch (error) {
      console.error('useServicePresets - Error in createServicesFromPresets:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar serviços'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createServicesFromPresets
  };
};
