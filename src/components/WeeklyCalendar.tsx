
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/components/ui/use-toast";
import AppointmentNotification from './AppointmentNotification';
import OptimizedAdminCalendarView from './admin/OptimizedAdminCalendarView';
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
  const [isUpdating, setIsUpdating] = useState(false);

  // Setup realtime notifications otimizadas para admin
  const { notifications, clearNotification } = useRealtimeNotifications({
    salonId: salon?.id || '',
    onNewAppointment: (appointment) => {
      console.log('🔔 New appointment notification received:', appointment);
      setCurrentNotification(appointment);
      setShowNotification(true);
      
      // Toast otimizado para admin
      toast({
        title: "🔔 Novo Agendamento!",
        description: `${appointment.client?.name || appointment.client?.username} solicitou agendamento para ${appointment.service?.name}`,
        duration: 8000,
      });
      
      // Atualizar lista imediatamente sem recarregar
      onRefresh();
    },
    onAppointmentUpdate: (appointment) => {
      console.log('📝 Appointment updated:', appointment);
      // Atualizar calendário em tempo real
      onRefresh();
    },
    onAppointmentStatusChange: (appointment) => {
      console.log('🔄 Appointment status changed:', appointment);
      // Atualizar calendário quando status mudar
      onRefresh();
    }
  });

  const handleUpdateAppointment = async (appointmentId: string, updates: { status: string; notes?: string }) => {
    setIsUpdating(true);
    try {
      console.log('🔄 Updating appointment:', appointmentId, updates);
      
      const result = await updateAppointmentStatus(appointmentId, updates.status as any);
      
      if (result.success) {
        toast({
          title: "✅ Agendamento Atualizado!",
          description: `Status alterado para ${updates.status}`,
        });
        
        onRefresh();
      } else {
        console.error('❌ Failed to update appointment:', result.message);
        toast({
          title: "Erro ao Atualizar",
          description: result.message || "Erro ao atualizar agendamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar agendamento",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptAppointment = async () => {
    if (currentNotification) {
      await handleUpdateAppointment(currentNotification.id, { status: 'confirmed' });
      setShowNotification(false);
      setCurrentNotification(null);
      clearNotification(currentNotification.id);
    }
  };

  const handleRejectAppointment = async () => {
    if (currentNotification) {
      await handleUpdateAppointment(currentNotification.id, { status: 'cancelled' });
      setShowNotification(false);
      setCurrentNotification(null);
      clearNotification(currentNotification.id);
    }
  };

  // Sempre renderizar a agenda otimizada
  return (
    <>
      <OptimizedAdminCalendarView 
        appointments={appointments}
        onUpdateAppointment={handleUpdateAppointment}
        isUpdating={isUpdating}
      />

      {/* Notification Modal Otimizada com som */}
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
