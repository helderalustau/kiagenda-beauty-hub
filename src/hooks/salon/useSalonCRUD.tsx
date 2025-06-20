import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '../useSupabaseData';

export const useSalonCRUD = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);

  // Create salon with improved error handling
  const createSalon = async (salonData: any) => {
    try {
      setLoading(true);
      console.log('Creating salon with data:', salonData);
      
      // Validate required fields - mais específico para super admin
      if (!salonData.owner_name?.trim()) {
        return { success: false, message: 'Nome do responsável é obrigatório' };
      }
      if (!salonData.phone?.trim()) {
        return { success: false, message: 'Telefone é obrigatório' };
      }
      // Para super admin, name e address são gerados automaticamente, então não validamos aqui
      // Apenas verificamos se existem
      if (!salonData.name) {
        return { success: false, message: 'Nome do estabelecimento é obrigatório' };
      }
      if (!salonData.address) {
        return { success: false, message: 'Endereço é obrigatório' };
      }

      // Clean the data before inserting - Allow null category for temporary salon
      const cleanSalonData = {
        name: salonData.name.trim(),
        owner_name: salonData.owner_name.trim(),
        phone: salonData.phone.trim(),
        address: salonData.address.trim(),
        category_id: salonData.category_id || null, // Allow null for temporary salons
        plan: salonData.plan || 'bronze',
        is_open: false,
        setup_completed: false,
        max_attendants: 1,
        city: salonData.city?.trim() || null,
        state: salonData.state?.trim() || null,
        street_number: salonData.street_number?.trim() || null,
        contact_phone: salonData.contact_phone?.trim() || salonData.phone.trim()
      };

      console.log('Clean salon data:', cleanSalonData);
      
      const { data, error } = await supabase
        .from('salons')
        .insert(cleanSalonData)
        .select()
        .single();

      if (error) {
        console.error('Detailed Supabase error:', error);
        
        // Return more specific error messages
        if (error.code === '23505') {
          return { success: false, message: 'Já existe um estabelecimento com estes dados' };
        } else if (error.code === '23502') {
          // Identificar qual campo específico está faltando
          const missingField = error.message.includes('name') ? 'nome' :
                              error.message.includes('owner_name') ? 'nome do responsável' :
                              error.message.includes('phone') ? 'telefone' :
                              error.message.includes('address') ? 'endereço' :
                              error.message.includes('category_id') ? 'categoria (pode ser nulo para estabelecimentos temporários)' :
                              'campo obrigatório';
          return { success: false, message: `Campo obrigatório não preenchido: ${missingField}` };
        } else if (error.code === '42501') {
          return { success: false, message: 'Erro de permissão. Verifique as configurações do banco' };
        } else {
          return { success: false, message: `Erro ao criar estabelecimento: ${error.message}` };
        }
      }

      console.log('Salon created successfully:', data);
      return { success: true, salon: data };
    } catch (error) {
      console.error('Unexpected error creating salon:', error);
      return { success: false, message: 'Erro inesperado ao criar estabelecimento' };
    } finally {
      setLoading(false);
    }
  };

  // Fetch salon data with cache optimization
  const fetchSalonData = async (salonId: string) => {
    try {
      // Check if we already have the data in cache
      if (salon && salon.id === salonId) {
        console.log('Using cached salon data');
        return;
      }

      setLoading(true);
      console.log('Fetching salon data:', salonId);
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) {
        console.error('Error fetching salon:', error);
        return;
      }

      console.log('Salon data loaded:', data);
      setSalon(data as Salon);
    } catch (error) {
      console.error('Error fetching salon data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch salon by slug
  const fetchSalonBySlug = async (slug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('unique_slug', slug)
        .single();

      if (error) {
        console.error('Error fetching salon by slug:', error);
        return null;
      }

      return data as Salon;
    } catch (error) {
      console.error('Error fetching salon by slug:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all salons
  const fetchAllSalons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching salons:', error);
        return;
      }

      setSalons(data as Salon[] || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSalon = async (salonData: any) => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .update(salonData)
        .eq('id', salonData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating salon:', error);
        return { success: false, message: 'Erro ao atualizar estabelecimento' };
      }

      // Update local state
      setSalon(data as Salon);
      return { success: true, salon: data };
    } catch (error) {
      console.error('Error updating salon:', error);
      return { success: false, message: 'Erro ao atualizar estabelecimento' };
    }
  };

  const deleteSalon = async (salonId: string) => {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', salonId);

      if (error) {
        console.error('Error deleting salon:', error);
        return { success: false, message: 'Erro ao excluir estabelecimento' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting salon:', error);
      return { success: false, message: 'Erro ao excluir estabelecimento' };
    }
  };

  return {
    salon,
    salons,
    loading,
    createSalon,
    fetchSalonData,
    fetchSalonBySlug,
    fetchAllSalons,
    updateSalon,
    deleteSalon,
    setSalon,
    setSalons
  };
};
