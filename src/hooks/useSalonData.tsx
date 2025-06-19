import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from './useSupabaseData';

export const useSalonData = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);

  // Create salon with improved error handling
  const createSalon = async (salonData: any) => {
    try {
      setLoading(true);
      console.log('Creating salon with data:', salonData);
      
      // Validate required fields
      if (!salonData.owner_name?.trim()) {
        return { success: false, message: 'Nome do responsável é obrigatório' };
      }
      if (!salonData.phone?.trim()) {
        return { success: false, message: 'Telefone é obrigatório' };
      }

      // Clean the data before inserting
      const cleanSalonData = {
        name: salonData.name.trim(),
        owner_name: salonData.owner_name.trim(),
        phone: salonData.phone.trim(),
        address: salonData.address,
        category_id: salonData.category_id,
        plan: salonData.plan || 'bronze',
        is_open: false,
        setup_completed: false,
        max_attendants: 1
      };

      console.log('Clean salon data:', cleanSalonData);
      
      const { data, error } = await supabase
        .from('salons')
        .insert(cleanSalonData)
        .select()
        .single();

      if (error) {
        console.error('Detailed Supabase error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Return more specific error messages
        if (error.code === '23505') {
          return { success: false, message: 'Já existe um estabelecimento com estes dados' };
        } else if (error.code === '23502') {
          return { success: false, message: 'Campos obrigatórios não preenchidos' };
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

  // Fetch salon data
  const fetchSalonData = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) {
        console.error('Error fetching salon:', error);
        return;
      }

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

  const toggleSalonStatus = async (salonId: string, isOpen: boolean) => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .update({ is_open: isOpen })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling salon status:', error);
        return { success: false, message: 'Erro ao alterar status' };
      }

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error toggling salon status:', error);
      return { success: false, message: 'Erro ao alterar status' };
    }
  };

  const uploadSalonBanner = async (file: File, salonId: string) => {
    try {
      console.log('Starting banner upload for salon:', salonId);
      
      // Ensure the bucket exists first
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      if (bucketListError) {
        console.error('Error listing buckets:', bucketListError);
      } else {
        console.log('Available buckets:', buckets);
        const salonAssetsBucket = buckets?.find(bucket => bucket.name === 'salon-assets');
        if (!salonAssetsBucket) {
          console.warn('salon-assets bucket not found, upload may fail');
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${salonId}-${Math.random()}.${fileExt}`;
      const filePath = `salon-banners/${fileName}`;

      console.log('Uploading file to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('salon-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        return { success: false, message: `Erro ao fazer upload da imagem: ${uploadError.message}` };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      const { data, error } = await supabase
        .from('salons')
        .update({ banner_image_url: publicUrl })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error updating salon banner:', error);
        return { success: false, message: 'Erro ao atualizar banner' };
      }

      console.log('Banner updated successfully');
      return { success: true, salon: data };
    } catch (error) {
      console.error('Unexpected error uploading salon banner:', error);
      return { success: false, message: 'Erro inesperado ao fazer upload' };
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

  const completeSalonSetup = async (salonId: string, setupData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('salons')
        .update({
          ...setupData,
          setup_completed: true,
          is_open: true
        })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error completing salon setup:', error);
        return { success: false, message: 'Erro ao finalizar configuração' };
      }

      setSalon(data as Salon);
      return { success: true, salon: data };
    } catch (error) {
      console.error('Error completing salon setup:', error);
      return { success: false, message: 'Erro ao finalizar configuração' };
    } finally {
      setLoading(false);
    }
  };

  const cleanupSalonsWithoutAdmins = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_salons_without_admins');

      if (error) {
        console.error('Error cleaning up salons:', error);
        return { success: false, message: 'Erro ao limpar estabelecimentos' };
      }

      return { success: true, deletedCount: data };
    } catch (error) {
      console.error('Error cleaning up salons:', error);
      return { success: false, message: 'Erro ao limpar estabelecimentos' };
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
    toggleSalonStatus,
    uploadSalonBanner,
    updateSalon,
    deleteSalon,
    completeSalonSetup,
    cleanupSalonsWithoutAdmins,
    setSalon,
    setSalons
  };
};
