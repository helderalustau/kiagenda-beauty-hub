
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface SalonUser {
  id: string;
  salon_id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  is_owner: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSalonUsers = () => {
  const [salonUsers, setSalonUsers] = useState<SalonUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSalonUsers = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salon_users')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at');

      if (error) {
        console.error('Error fetching salon users:', error);
        return;
      }

      setSalonUsers(data || []);
    } catch (error) {
      console.error('Error fetching salon users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSalonUser = async (salonId: string, userData: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('salon_users')
        .insert({
          salon_id: salonId,
          name: userData.name,
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'user',
          is_owner: false,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      setSalonUsers(prev => [...prev, data]);
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!"
      });

      return { success: true, user: data };
    } catch (error) {
      console.error('Error creating salon user:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive"
      });
      return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const updateSalonUser = async (userId: string, userData: Partial<SalonUser>) => {
    try {
      const { data, error } = await supabase
        .from('salon_users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      setSalonUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...data } : user
      ));

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating salon user:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive"
      });
      return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const deleteSalonUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('salon_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setSalonUsers(prev => prev.filter(user => user.id !== userId));

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!"
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting salon user:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário",
        variant: "destructive"
      });
      return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  return {
    salonUsers,
    loading,
    fetchSalonUsers,
    createSalonUser,
    updateSalonUser,
    deleteSalonUser,
    setSalonUsers
  };
};
