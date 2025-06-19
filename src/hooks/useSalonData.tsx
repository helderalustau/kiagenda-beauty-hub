
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from './useSupabaseData';

export const useSalonData = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);

  // Create salon
  const createSalon = async (salonData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('salons')
        .insert(salonData)
        .select()
        .single();

      if (error) {
        console.error('Error creating salon:', error);
        return { success: false, message: 'Erro ao criar estabelecimento' };
      }

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error creating salon:', error);
      return { success: false, message: 'Erro ao criar estabelecimento' };
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${salonId}-${Math.random()}.${fileExt}`;
      const filePath = `salon-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('salon-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return { success: false, message: 'Erro ao fazer upload da imagem' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(filePath);

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

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error uploading salon banner:', error);
      return { success: false, message: 'Erro ao fazer upload' };
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
