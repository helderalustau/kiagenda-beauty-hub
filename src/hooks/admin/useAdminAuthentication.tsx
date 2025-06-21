
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordSecurity } from '../usePasswordSecurity';
import { useInputValidation } from '../useInputValidation';

export const useAdminAuthentication = () => {
  const [loading, setLoading] = useState(false);
  const { verifyPassword, hashPassword } = usePasswordSecurity();
  const { sanitizeAndValidate } = useInputValidation();

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

  return {
    loading,
    authenticateAdmin
  };
};
