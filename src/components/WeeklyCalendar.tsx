
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/components/ui/use-toast";
import AppointmentNotification from './AppointmentNotification';
import AdminCalendarView from './admin/AdminCalendarView';
import { Appointment } from '@/types/supabase-entities';

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onRefresh: () => Promise<void>;
}

const WeeklyCalendar = ({ appointments, onRefresh }: WeeklyCalendarProps) => {
  const { user } = useAuth();
  const { salon } = useSupabaseData();
  const { updateAppointmentStatus } = useAppointmentData();
  const { toast } = useToast();
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Appointment | null>(null);

  // Setup realtime notifications
  const { notifications, clearNotification } = useRealtimeNotifications({
    salonId: salon?.id || '',
    onNewAppointment: (appointment) => {
      console.log('🔔 New appointment notification received:', appointment);
      setCurrentNotification(appointment);
      setShowNotification(true);
      
      // Mostrar toast também
      toast({
        title: "🔔 Novo Agendamento!",
        description: `${appointment.client?.name} solicitou agendamento para ${appointment.service?.name}`,
        duration: 8000,
      });
      
      // Atualizar lista imediatamente
      onRefresh();
    },
    onAppointmentUpdate: (appointment) => {
      console.log('📝 Appointment updated:', appointment);
      onRefresh();
    }
  });

  const handleAcceptAppointment = async () => {
    if (currentNotification) {
      try {
        const result = await updateAppointmentStatus(currentNotification.id, 'confirmed');
        
        if (result.success) {
          toast({
            title: "✅ Agendamento Aprovado!",
            description: `Agendamento de ${currentNotification.client?.name} foi confirmado.`,
          });
          
          setShowNotification(false);
          setCurrentNotification(null);
          clearNotification(currentNotification.id);
          onRefresh();
        } else {
          toast({
            title: "Erro",
            description: result.message || "Erro ao aprovar agendamento",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error accepting appointment:', error);
        toast({
          title: "Erro",
          description: "Erro ao aprovar agendamento",
          variant: "destructive"
        });
      }
    }
  };

  const handleRejectAppointment = async () => {
    if (currentNotification) {
      try {
        const result = await updateAppointmentStatus(currentNotification.id, 'cancelled');
        
        if (result.success) {
          toast({
            title: "❌ Agendamento Recusado",
            description: `Agendamento de ${currentNotification.client?.name} foi cancelado.`,
          });
          
          setShowNotification(false);
          setCurrentNotification(null);
          clearNotification(currentNotification.id);
          onRefresh();
        } else {
          toast({
            title: "Erro",
            description: result.message || "Erro ao recusar agendamento",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error rejecting appointment:', error);
        toast({
          title: "Erro",
          description: "Erro ao recusar agendamento",
          variant: "destructive"
        });
      }
    }
  };

  // Sempre renderizar a agenda, mesmo sem salon
  return (
    <>
      <AdminCalendarView 
        appointments={appointments}
        onRefresh={onRefresh}
        salonId={salon?.id || ''}
      />

      {/* Notification Modal */}
      <AppointmentNotification
        isOpen={showNotification}
        appointment={currentNotification}
        soundType={salon?.notification_sound as 'default' | 'bell' | 'chime' | 'alert' || 'default'}
        onAccept={handleAcceptAppointment}
        onReject={handleRejectAppointment}
      />
    </>
  );
};

export default WeeklyCalendar;
