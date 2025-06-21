
import { supabase } from '@/integrations/supabase/client';

export const usePasswordSecurity = () => {
  // Hash password using database function
  const hashPassword = async (password: string): Promise<string> => {
    const { data, error } = await supabase.rpc('hash_password', { password });
    
    if (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
    
    return data;
  };

  // Verify password using database function
  const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('verify_password', { password, hash });
    
    if (error) {
      console.error('Error verifying password:', error);
      return false;
    }
    
    return data;
  };

  // Validate password strength
  const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    hashPassword,
    verifyPassword,
    validatePasswordStrength
  };
};
