
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const useAuthData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Authenticate admin user
  const authenticateAdmin = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      if (data) {
        localStorage.setItem('adminAuth', JSON.stringify({
          id: data.id,
          name: data.name,
          role: data.role,
          salon_id: data.salon_id
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

  // Authenticate client
  const authenticateClient = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Client authentication error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      if (data) {
        localStorage.setItem('clientAuth', JSON.stringify({
          id: data.id,
          name: data.name
        }));
        
        return { success: true, client: data };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Error during client authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Register client
  const registerClient = async (name: string, password: string, phone: string, email?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_auth')
        .insert({
          name,
          password,
          phone,
          email
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering client:', error);
        return { success: false, message: 'Erro ao registrar cliente' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error registering client:', error);
      return { success: false, message: 'Erro ao registrar cliente' };
    } finally {
      setLoading(false);
    }
  };

  // Register admin
  const registerAdmin = async (salonId: string, name: string, password: string, email: string, phone?: string, role: string = 'admin') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_auth')
        .insert({
          salon_id: salonId,
          name,
          password,
          email,
          phone,
          role
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering admin:', error);
        return { success: false, message: 'Erro ao registrar administrador' };
      }

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
      const { data, error } = await supabase
        .from('admin_auth')
        .update(adminData)
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
    authenticateClient,
    registerClient,
    registerAdmin,
    updateAdminUser,
    deleteAdminUser
  };
};
