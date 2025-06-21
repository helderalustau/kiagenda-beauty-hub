
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/types/supabase-entities';

export const useAdminUsersData = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch admin users for current salon
  const fetchAdminUsers = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('salon_id', salonId)
        .order('name');

      if (error) {
        console.error('Error fetching admin users:', error);
        return;
      }

      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    adminUsers,
    loading,
    fetchAdminUsers,
    setAdminUsers
  };
};
