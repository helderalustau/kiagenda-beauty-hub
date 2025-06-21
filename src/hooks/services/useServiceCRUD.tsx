
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/supabase-entities';

export const useServiceCRUD = () => {
  const [loading, setLoading] = useState(false);

  // Create a single service
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useServiceCRUD - Creating service with data:', serviceData);
      
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

      console.log('useServiceCRUD - Inserting service data:', insertData);

      const { data, error } = await supabase
        .from('services')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('useServiceCRUD - Database error creating service:', error);
        throw error;
      }

      console.log('useServiceCRUD - Service created successfully:', data);
      
      return { success: true, service: data };
    } catch (error) {
      console.error('useServiceCRUD - Error in createService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar serviço'
      };
    }
  };

  // Update service
  const updateService = async (serviceId: string, updateData: Partial<Service>) => {
    try {
      console.log('useServiceCRUD - Updating service:', serviceId, updateData);
      
      if (!serviceId) {
        throw new Error('ID do serviço é obrigatório');
      }

      // Validate the update data
      const cleanUpdateData: any = {};
      
      if (updateData.name !== undefined) {
        if (!updateData.name?.trim()) {
          throw new Error('Nome do serviço não pode estar vazio');
        }
        cleanUpdateData.name = updateData.name.trim();
      }
      
      if (updateData.description !== undefined) {
        cleanUpdateData.description = updateData.description?.trim() || null;
      }
      
      if (updateData.price !== undefined) {
        const price = Number(updateData.price);
        if (isNaN(price) || price <= 0) {
          throw new Error('Preço deve ser um número válido maior que zero');
        }
        cleanUpdateData.price = price;
      }
      
      if (updateData.duration_minutes !== undefined) {
        const duration = Number(updateData.duration_minutes);
        if (isNaN(duration) || duration <= 0) {
          throw new Error('Duração deve ser um número válido maior que zero');
        }
        cleanUpdateData.duration_minutes = duration;
      }
      
      if (updateData.active !== undefined) {
        cleanUpdateData.active = Boolean(updateData.active);
      }
      
      // Add updated_at timestamp
      cleanUpdateData.updated_at = new Date().toISOString();

      console.log('useServiceCRUD - Clean update data:', cleanUpdateData);

      const { data, error } = await supabase
        .from('services')
        .update(cleanUpdateData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        console.error('useServiceCRUD - Error updating service:', error);
        throw error;
      }

      console.log('useServiceCRUD - Service updated successfully:', data);
      
      return { success: true, service: data };
    } catch (error) {
      console.error('useServiceCRUD - Error in updateService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao atualizar serviço'
      };
    }
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    try {
      console.log('useServiceCRUD - Deleting service:', serviceId);
      
      if (!serviceId) {
        throw new Error('ID do serviço é obrigatório');
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('useServiceCRUD - Error deleting service:', error);
        throw error;
      }

      console.log('useServiceCRUD - Service deleted successfully');
      
      return { success: true };
    } catch (error) {
      console.error('useServiceCRUD - Error in deleteService:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir serviço'
      };
    }
  };

  // Toggle service status
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    const result = await updateService(serviceId, { active: !currentStatus });
    return result;
  };

  return {
    loading,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus
  };
};
