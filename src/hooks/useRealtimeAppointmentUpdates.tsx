
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface UseRealtimeAppointmentUpdatesProps {
  salonId?: string;
  clientId?: string;
  onAppointmentUpdate: () => void;
}

export const useRealtimeAppointmentUpdates = ({ 
  salonId, 
  clientId, 
  onAppointmentUpdate 
}: UseRealtimeAppointmentUpdatesProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!salonId && !clientId) return;

    console.log('🔔 Setting up realtime appointment updates', { salonId, clientId });

    const channel = supabase
      .channel(`appointment-updates-${salonId || clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: salonId ? `salon_id=eq.${salonId}` : `client_auth_id=eq.${clientId}`
        },
        (payload) => {
          console.log('🆕 New appointment detected:', payload);
          onAppointmentUpdate();
          
          if (salonId && payload.new.status === 'pending') {
            toast({
              title: "🔔 Novo Agendamento!",
              description: "Uma nova solicitação de agendamento foi recebida.",
              duration: 8000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: salonId ? `salon_id=eq.${salonId}` : `client_auth_id=eq.${clientId}`
        },
        (payload) => {
          console.log('📝 Appointment updated:', payload);
          onAppointmentUpdate();
          
          if (clientId) {
            if (payload.new.status === 'confirmed') {
              toast({
                title: "✅ Agendamento Confirmado!",
                description: "Seu agendamento foi aprovado pelo estabelecimento.",
                duration: 8000,
              });
            } else if (payload.new.status === 'cancelled') {
              toast({
                title: "❌ Agendamento Cancelado",
                description: "Seu agendamento foi cancelado pelo estabelecimento.",
                duration: 8000,
              });
            } else if (payload.new.status === 'completed') {
              toast({
                title: "🎉 Atendimento Concluído!",
                description: "Seu atendimento foi finalizado com sucesso.",
                duration: 8000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [salonId, clientId, onAppointmentUpdate, toast]);
};
