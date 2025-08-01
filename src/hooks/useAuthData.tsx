import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/types/supabase-entities';

export const useAuthData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const authenticateAdmin = async (name: string, password: string) => {
    try {
      setLoading(true);
      console.log('AuthData: Authenticating admin:', name);

      const { data, error } = await supabase
        .from('admin_auth')
        .select(`
          id,
          name,
          password,
          password_hash,
          email,
          phone,
          role,
          salon_id,
          salons:salon_id (
            id,
            name,
            is_open,
            setup_completed
          )
        `)
        .eq('name', name)
        .single();

      if (error || !data) {
        console.error('AuthData: Admin not found or error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      console.log('AuthData: Admin found, verifying password');

      let isPasswordValid = false;
      if (data.password_hash) {
        const { data: verifyResult } = await supabase.rpc('verify_password', {
          password: password,
          hash: data.password_hash
        });
        isPasswordValid = verifyResult;
      } else if (data.password === password) {
        isPasswordValid = true;
      }

      if (!isPasswordValid) {
        console.error('AuthData: Invalid password');
        return { success: false, message: 'Credenciais inválidas' };
      }

      const adminUser: AdminUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        salon_id: data.salon_id,
        created_at: '',
        updated_at: ''
      };

      console.log('AuthData: Authentication successful for admin:', adminUser.name);

      // Log the admin login
      try {
        const salonName = (data as any).salons?.name;
        await supabase.rpc('log_system_activity', {
          p_activity_type: 'admin_login',
          p_entity_type: 'admin',
          p_entity_id: data.id,
          p_user_id: data.id,
          p_salon_id: data.salon_id,
          p_title: `Login administrativo: ${data.name}`,
          p_description: `Administrador ${data.name}${salonName ? ` do estabelecimento ${salonName}` : ''} fez login no sistema`,
          p_metadata: {
            admin_name: data.name,
            salon_name: salonName,
            login_time: new Date().toISOString(),
            role: data.role
          }
        });
      } catch (logError) {
        console.error('Error logging admin login:', logError);
        // Don't fail the authentication if logging fails
      }

      return { 
        success: true, 
        admin: adminUser,
        salon: (data as any).salons
      };

    } catch (error) {
      console.error('AuthData: Unexpected error in authenticateAdmin:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const registerAdmin = async (adminData: any) => {
    try {
      setLoading(true);
      console.log('AuthData: Registering new admin:', adminData.name);
  
      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_auth')
        .select('name')
        .or(`name.eq.${adminData.name},email.eq.${adminData.email},phone.eq.${adminData.phone}`)
        .single();
  
      if (existingAdmin) {
        console.log('AuthData: Admin already exists');
        return { success: false, message: 'Administrador já cadastrado com este nome, email ou telefone' };
      }
  
      const { data, error } = await supabase
        .from('admin_auth')
        .insert([adminData])
        .select()
        .single();
  
      if (error) {
        console.error('AuthData: Error registering admin:', error);
        return { success: false, message: 'Erro ao registrar administrador' };
      }
  
      console.log('AuthData: Admin registered successfully:', data.name);
      return { success: true, admin: data };
  
    } catch (error) {
      console.error('AuthData: Unexpected error in registerAdmin:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const linkAdminToSalon = async (adminId: string, salonId: string) => {
    try {
      setLoading(true);
      console.log('AuthData: Linking admin to salon:', adminId, salonId);

      const { data, error } = await supabase
        .from('admin_auth')
        .update({ salon_id: salonId })
        .eq('id', adminId)
        .select()
        .single();

      if (error) {
        console.error('AuthData: Error linking admin to salon:', error);
        return { success: false, message: 'Erro ao vincular administrador ao estabelecimento' };
      }

      console.log('AuthData: Admin linked to salon successfully:', data.name, data.salon_id);
      return { success: true, admin: data };

    } catch (error) {
      console.error('AuthData: Unexpected error in linkAdminToSalon:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const updateAdminUser = async (adminId: string, adminData: any) => {
    try {
      setLoading(true);
      console.log('AuthData: Updating admin user:', adminId, adminData);

      const { data, error } = await supabase
        .from('admin_auth')
        .update(adminData)
        .eq('id', adminId)
        .select()
        .single();

      if (error) {
        console.error('AuthData: Error updating admin user:', error);
        return { success: false, message: 'Erro ao atualizar usuário administrador' };
      }

      console.log('AuthData: Admin user updated successfully:', data.name);
      return { success: true, admin: data };

    } catch (error) {
      console.error('AuthData: Unexpected error in updateAdminUser:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const deleteAdminUser = async (adminId: string) => {
    try {
      setLoading(true);
      console.log('AuthData: Deleting admin user:', adminId);

      const { error } = await supabase
        .from('admin_auth')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('AuthData: Error deleting admin user:', error);
        return { success: false, message: 'Erro ao excluir usuário administrador' };
      }

      console.log('AuthData: Admin user deleted successfully:', adminId);
      return { success: true };

    } catch (error) {
      console.error('AuthData: Unexpected error in deleteAdminUser:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const authenticateClient = async (name: string, password: string) => {
    try {
      setLoading(true);
      console.log('AuthData: Authenticating client:', name);

      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', name)
        .single();

      if (error || !data) {
        console.error('AuthData: Client not found or error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      console.log('AuthData: Client found, verifying password');

      let isPasswordValid = false;
      if (data.password_hash) {
        const { data: verifyResult } = await supabase.rpc('verify_password', {
          password: password,
          hash: data.password_hash
        });
        isPasswordValid = verifyResult;
      } else if (data.password === password) {
        isPasswordValid = true;
      }

      if (!isPasswordValid) {
        console.error('AuthData: Invalid password for client');
        return { success: false, message: 'Credenciais inválidas' };
      }

      console.log('AuthData: Client authentication successful:', data.name);
      return { success: true, client: data };

    } catch (error) {
      console.error('AuthData: Unexpected error in authenticateClient:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const registerClient = async (clientData: any) => {
    try {
      setLoading(true);
      console.log('AuthData: Registering new client:', clientData.name);

      // Check if client already exists
      const { data: existingClient } = await supabase
        .from('client_auth')
        .select('name')
        .or(`name.eq.${clientData.name},phone.eq.${clientData.phone}`)
        .single();

      if (existingClient) {
        console.log('AuthData: Client already exists');
        return { success: false, message: 'Cliente já cadastrado com este nome ou telefone' };
      }

      const { data, error } = await supabase
        .from('client_auth')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('AuthData: Error registering client:', error);
        return { success: false, message: 'Erro ao registrar cliente' };
      }

      console.log('AuthData: Client registered successfully:', data.name);
      return { success: true, client: data };

    } catch (error) {
      console.error('AuthData: Unexpected error in registerClient:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const updateClientProfile = async (clientId: string, clientData: any) => {
    try {
      setLoading(true);
      console.log('AuthData: Updating client profile:', clientId, clientData);
  
      const { data, error } = await supabase
        .from('client_auth')
        .update(clientData)
        .eq('id', clientId)
        .select()
        .single();
  
      if (error) {
        console.error('AuthData: Error updating client profile:', error);
        return { success: false, message: 'Erro ao atualizar perfil do cliente' };
      }
  
      console.log('AuthData: Client profile updated successfully:', data.name);
      return { success: true, client: data };
  
    } catch (error) {
      console.error('AuthData: Unexpected error in updateClientProfile:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    authenticateAdmin,
    authenticateClient,
    registerClient,
    registerAdmin,
    linkAdminToSalon,
    updateAdminUser,
    deleteAdminUser,
    updateClientProfile
  };
};
