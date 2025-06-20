
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface HierarchyLink {
  super_admin_code: string;
  salon_code: string;
  admin_code: string;
  success: boolean;
}

export const useHierarchyData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createHierarchyLink = async (
    salonId: string,
    adminId: string,
    salonName: string,
    adminName: string
  ): Promise<{ success: boolean; data?: HierarchyLink; message?: string }> => {
    try {
      setLoading(true);
      console.log('Criando vínculos hierárquicos para:', { salonId, adminId, salonName, adminName });

      const { data, error } = await supabase.rpc('create_admin_hierarchy_link', {
        p_salon_id: salonId,
        p_admin_id: adminId,
        p_salon_name: salonName,
        p_admin_name: adminName
      });

      if (error) {
        console.error('Erro ao criar vínculos hierárquicos:', error);
        return { success: false, message: 'Erro ao criar vínculos hierárquicos: ' + error.message };
      }

      console.log('Vínculos hierárquicos criados com sucesso:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Erro inesperado ao criar vínculos hierárquicos:', error);
      return { success: false, message: 'Erro inesperado ao criar vínculos hierárquicos' };
    } finally {
      setLoading(false);
    }
  };

  const getHierarchyByAdmin = async (adminId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_hierarchy')
        .select('*')
        .eq('admin_id', adminId)
        .single();

      if (error) {
        console.error('Erro ao buscar hierarquia do admin:', error);
        return { success: false, message: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar hierarquia:', error);
      return { success: false, message: 'Erro ao buscar hierarquia' };
    } finally {
      setLoading(false);
    }
  };

  const getHierarchyBySuperAdmin = async (superAdminCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_hierarchy')
        .select(`
          *,
          salons:salon_id(*),
          admin_auth:admin_id(*)
        `)
        .eq('super_admin_code', superAdminCode);

      if (error) {
        console.error('Erro ao buscar hierarquia do super admin:', error);
        return { success: false, message: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar hierarquia do super admin:', error);
      return { success: false, message: 'Erro ao buscar hierarquia do super admin' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createHierarchyLink,
    getHierarchyByAdmin,
    getHierarchyBySuperAdmin
  };
};
