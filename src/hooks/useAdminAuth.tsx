import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordSecurity } from './usePasswordSecurity';
import { useInputValidation } from './useInputValidation';

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(false);
  const { verifyPassword, hashPassword, validatePasswordStrength } = usePasswordSecurity();
  const { sanitizeAndValidate } = useInputValidation();

  // Authenticate admin user with secure password verification
  const authenticateAdmin = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Validate and sanitize inputs
      const usernameValidation = sanitizeAndValidate(username, 'name');
      if (!usernameValidation.isValid) {
        return { success: false, message: usernameValidation.error || 'Nome de usuário inválido' };
      }

      if (!password || password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // First get the user record with password hash
      const { data: adminRecord, error: fetchError } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', usernameValidation.value)
        .single();

      if (fetchError || !adminRecord) {
        console.error('Authentication error:', fetchError);
        return { success: false, message: 'Credenciais inválidas' };
      }

      // Verify password using hash if available, fallback to plaintext for migration period
      let isPasswordValid = false;
      if (adminRecord.password_hash) {
        isPasswordValid = await verifyPassword(password, adminRecord.password_hash);
      } else if (adminRecord.password) {
        // Fallback for migration period - hash and update the password
        isPasswordValid = adminRecord.password === password;
        if (isPasswordValid) {
          const hashedPassword = await hashPassword(password);
          await supabase
            .from('admin_auth')
            .update({ password_hash: hashedPassword })
            .eq('id', adminRecord.id);
        }
      }

      if (!isPasswordValid) {
        return { success: false, message: 'Credenciais inválidas' };
      }

      // Get salon data if available
      let salonData = null;
      if (adminRecord.salon_id) {
        const { data: salon } = await supabase
          .from('salons')
          .select('*')
          .eq('id', adminRecord.salon_id)
          .single();
        salonData = salon;
      }

      const adminData = {
        ...adminRecord,
        salons: salonData ? [salonData] : []
      };

      localStorage.setItem('adminAuth', JSON.stringify({
        id: adminData.id,
        name: adminData.name,
        role: adminData.role,
        salon_id: adminData.salon_id,
        unique_admin_code: adminData.unique_admin_code,
        salon_code: adminData.salon_code,
        super_admin_link_code: adminData.super_admin_link_code,
        hierarchy_level: adminData.hierarchy_level
      }));
      
      return { success: true, admin: adminData };
    } catch (error) {
      console.error('Error during authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Register admin with secure password hashing
  const registerAdmin = async (salonId: string | null, name: string, password: string, email: string, phone?: string, role: string = 'admin') => {
    try {
      setLoading(true);
      
      // Validate inputs
      const nameValidation = sanitizeAndValidate(name, 'name');
      if (!nameValidation.isValid) {
        return { success: false, message: nameValidation.error || 'Nome inválido' };
      }

      const emailValidation = sanitizeAndValidate(email, 'email');
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error || 'Email inválido' };
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          message: `Senha não atende aos requisitos: ${passwordValidation.errors.join(', ')}`
        };
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      const adminData = {
        salon_id: salonId,
        name: nameValidation.value,
        password_hash: hashedPassword,
        email: emailValidation.value,
        phone: phone?.replace(/\D/g, '') || null,
        role,
        hierarchy_level: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Registering admin with secure data');
      
      const { data, error } = await supabase
        .from('admin_auth')
        .insert(adminData)
        .select()
        .single();

      if (error) {
        console.error('Error registering admin:', error);
        return { success: false, message: 'Erro ao registrar administrador: ' + error.message };
      }

      console.log('Admin registered successfully');
      return { success: true, admin: data };
    } catch (error) {
      console.error('Error registering admin:', error);
      return { success: false, message: 'Erro ao registrar administrador' };
    } finally {
      setLoading(false);
    }
  };

  // Link admin to salon after plan selection
  const linkAdminToSalon = async (adminId: string, salonId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_auth')
        .update({ 
          salon_id: salonId,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)
        .select()
        .single();

      if (error) {
        console.error('Error linking admin to salon:', error);
        return { success: false, message: 'Erro ao vincular administrador ao estabelecimento' };
      }

      return { success: true, admin: data };
    } catch (error) {
      console.error('Error linking admin to salon:', error);
      return { success: false, message: 'Erro ao vincular administrador ao estabelecimento' };
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
    linkAdminToSalon,
    updateAdminUser,
    deleteAdminUser
  };
};
