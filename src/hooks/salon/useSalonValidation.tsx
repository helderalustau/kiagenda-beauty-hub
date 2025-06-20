
import { Salon } from '../useSupabaseData';

export const useSalonValidation = () => {
  const validateSalonData = (salonData: any) => {
    // Validate required fields
    if (!salonData.owner_name?.trim()) {
      return { success: false, message: 'Nome do responsável é obrigatório' };
    }
    if (!salonData.phone?.trim()) {
      return { success: false, message: 'Telefone é obrigatório' };
    }
    if (!salonData.name) {
      return { success: false, message: 'Nome do estabelecimento é obrigatório' };
    }
    if (!salonData.address) {
      return { success: false, message: 'Endereço é obrigatório' };
    }

    return { success: true };
  };

  const cleanSalonData = (salonData: any) => {
    return {
      name: salonData.name.trim(),
      owner_name: salonData.owner_name.trim(),
      phone: salonData.phone.trim(),
      address: salonData.address.trim(),
      plan: salonData.plan || 'bronze',
      is_open: false,
      setup_completed: false,
      max_attendants: 1,
      city: salonData.city?.trim() || null,
      state: salonData.state?.trim() || null,
      street_number: salonData.street_number?.trim() || null,
      contact_phone: salonData.contact_phone?.trim() || salonData.phone.trim()
    };
  };

  const handleSupabaseError = (error: any) => {
    console.error('Detailed Supabase error:', error);
    
    if (error.code === '23505') {
      return { success: false, message: 'Já existe um estabelecimento com estes dados' };
    } else if (error.code === '23502') {
      const missingField = error.message.includes('name') ? 'nome' :
                          error.message.includes('owner_name') ? 'nome do responsável' :
                          error.message.includes('phone') ? 'telefone' :
                          error.message.includes('address') ? 'endereço' :
                          'campo obrigatório';
      return { success: false, message: `Campo obrigatório não preenchido: ${missingField}` };
    } else if (error.code === '42501') {
      return { success: false, message: 'Erro de permissão. Verifique as configurações do banco' };
    } else {
      return { success: false, message: `Erro ao criar estabelecimento: ${error.message}` };
    }
  };

  return {
    validateSalonData,
    cleanSalonData,
    handleSupabaseError
  };
};
