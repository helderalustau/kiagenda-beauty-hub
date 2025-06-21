
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from '@/types/supabase-entities';

interface UseRealtimeNotificationsProps {
  salonId: string;
  onNewAppointment?: (appointment: Appointment) => void;
  onAppointmentUpdate?: (appointment: Appointment) => void;
}

export const useRealtimeNotifications = ({ 
  salonId, 
  onNewAppointment, 
  onAppointmentUpdate 
}: UseRealtimeNotificationsProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!salonId) return;

    console.log('Setting up realtime notifications for salon:', salonId);

    // Setup realtime subscription for appointments
    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('New appointment received:', payload);
          
          // Fetch complete appointment data with relations
          const { data: appointment, error } = await supabase
            .from('appointments')
            .select(`
              *,
              salon:salons(id, name, address, phone),
              service:services(id, name, price, duration_minutes),
              client:clients(id, name, phone, email)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching appointment details:', error);
            return;
          }

          if (appointment) {
            // Add to notifications list
            setNotifications(prev => [appointment as Appointment, ...prev]);
            
            // Show toast notification
            toast({
              title: "🔔 Novo Agendamento!",
              description: `${appointment.client?.name} solicitou um agendamento para ${appointment.service?.name}`,
              duration: 10000,
            });

            // Call callback if provided
            if (onNewAppointment) {
              onNewAppointment(appointment as Appointment);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('Appointment updated:', payload);
          
          // Fetch complete appointment data with relations
          const { data: appointment, error } = await supabase
            .from('appointments')
            .select(`
              *,
              salon:salons(id, name, address, phone),
              service:services(id, name, price, duration_minutes),
              client:clients(id, name, phone, email)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching updated appointment:', error);
            return;
          }

          if (appointment && onAppointmentUpdate) {
            onAppointmentUpdate(appointment as Appointment);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [salonId, onNewAppointment, onAppointmentUpdate, toast]);

  const clearNotification = (appointmentId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== appointmentId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotification,
    clearAllNotifications
  };
};
