
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemActivityLog } from '@/types/supabase-entities';
import { useToast } from "@/components/ui/use-toast";

export const useSystemActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      console.log('Fetching system activity logs...');
      
      const { data, error } = await supabase
        .from('system_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limitar aos últimos 100 registros

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      console.log('Activity logs fetched successfully:', data?.length || 0);
      
      // Converter os dados para o tipo correto
      const formattedLogs: SystemActivityLog[] = (data || []).map(log => ({
        ...log,
        metadata: log.metadata as Record<string, any> || {},
        ip_address: log.ip_address ? String(log.ip_address) : undefined,
        description: log.description || undefined,
        entity_id: log.entity_id || undefined,
        user_id: log.user_id || undefined,
        salon_id: log.salon_id || undefined,
        user_agent: log.user_agent || undefined
      }));
      
      setActivityLogs(formattedLogs);
    } catch (error) {
      console.error('Error in fetchActivityLogs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logs de atividade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logAdminLogin = async (adminName: string, salonName?: string) => {
    try {
      await supabase.rpc('log_system_activity', {
        p_activity_type: 'admin_login',
        p_entity_type: 'admin',
        p_title: `Login administrativo: ${adminName}`,
        p_description: `Administrador ${adminName} ${salonName ? `do estabelecimento ${salonName}` : ''} fez login no sistema`,
        p_metadata: {
          admin_name: adminName,
          salon_name: salonName,
          login_time: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging admin login:', error);
    }
  };

  useEffect(() => {
    fetchActivityLogs();

    // Configurar realtime subscription
    const channel = supabase
      .channel('system-activity-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_activity_logs'
        },
        (payload) => {
          console.log('New activity log received:', payload.new);
          const newLog = {
            ...payload.new,
            metadata: payload.new.metadata as Record<string, any> || {},
            ip_address: payload.new.ip_address ? String(payload.new.ip_address) : undefined,
            description: payload.new.description || undefined,
            entity_id: payload.new.entity_id || undefined,
            user_id: payload.new.user_id || undefined,
            salon_id: payload.new.salon_id || undefined,
            user_agent: payload.new.user_agent || undefined
          } as SystemActivityLog;
          
          setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]); // Manter apenas 100 registros
          
          // Mostrar toast para atividades importantes
          if (['client_registration', 'appointment_created', 'appointment_completed'].includes(newLog.activity_type)) {
            toast({
              title: "Nova Atividade",
              description: newLog.title,
              duration: 3000
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    activityLogs,
    loading,
    fetchActivityLogs,
    logAdminLogin
  };
};
