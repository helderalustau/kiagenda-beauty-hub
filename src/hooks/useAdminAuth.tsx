
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(false);

  // Authenticate admin user
  const authenticateAdmin = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_auth')
        .select(`
          *,
          salons:salon_id(*)
        `)
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      if (data) {
        // Include hierarchy codes in auth data
        localStorage.setItem('adminAuth', JSON.stringify({
          id: data.id,
          name: data.name,
          role: data.role,
          salon_id: data.salon_id,
          unique_admin_code: data.unique_admin_code,
          salon_code: data.salon_code,
          super_admin_link_code: data.super_admin_link_code,
          hierarchy_level: data.hierarchy_level
        }));
        
        return { success: true, admin: data };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Error during authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Register admin with hierarchy codes
  const registerAdmin = async (salonId: string, name: string, password: string, email: string, phone?: string, role: string = 'admin') => {
    try {
      setLoading(true);
      
      const adminData = {
        salon_id: salonId,
        name: name.trim(),
        password,
        email: email.trim(),
        phone: phone?.replace(/\D/g, '') || null,
        role,
        hierarchy_level: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Registering admin with data:', adminData);
      
      const { data, error } = await supabase
        .from('admin_auth')
        .insert(adminData)
        .select()
        .single();

      if (error) {
        console.error('Error registering admin:', error);
        return { success: false, message: 'Erro ao registrar administrador: ' + error.message };
      }

      console.log('Admin registered successfully:', data);
      return { success: true, admin: data };
    } catch (error) {
      console.error('Error registering admin:', error);
      return { success: false, message: 'Erro ao registrar administrador' };
    } finally {
      setLoading(false);
    }
  };

  const updateAdminUser = async (adminData: any) => {
    try {
      const updatedData = {
        ...adminData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('admin_auth')
        .update(updatedData)
        .eq('id', adminData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating admin user:', error);
        return { success: false, message: 'Erro ao atualizar usuário' };
      }

      return { success: true, admin: data };
    } catch (error) {
      console.error('Error updating admin user:', error);
      return { success: false, message: 'Erro ao atualizar usuário' };
    }
  };

  const deleteAdminUser = async (adminId: string) => {
    try {
      const { error } = await supabase
        .from('admin_auth')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('Error deleting admin user:', error);
        return { success: false, message: 'Erro ao excluir usuário' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return { success: false, message: 'Erro ao excluir usuário' };
    }
  };

  return {
    loading,
    authenticateAdmin,
    registerAdmin,
    updateAdminUser,
    deleteAdminUser
  };
};
