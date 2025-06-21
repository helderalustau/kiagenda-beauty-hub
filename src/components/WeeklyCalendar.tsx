
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
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
  const { toast } = useToast();
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Appointment | null>(null);

  // Setup realtime notifications
  const { notifications, clearNotification } = useRealtimeNotifications({
    salonId: salon?.id || '',
    onNewAppointment: (appointment) => {
      console.log('New appointment notification:', appointment);
      setCurrentNotification(appointment);
      setShowNotification(true);
    },
    onAppointmentUpdate: (appointment) => {
      console.log('Appointment updated:', appointment);
      onRefresh();
    }
  });

  const handleAcceptAppointment = async () => {
    if (currentNotification) {
      try {
        const { updateAppointmentStatus } = useSupabaseData();
        await updateAppointmentStatus(currentNotification.id, 'confirmed');
        
        toast({
          title: "Agendamento Aprovado!",
          description: `Agendamento de ${currentNotification.client?.name} foi confirmado.`,
        });
        
        setShowNotification(false);
        setCurrentNotification(null);
        clearNotification(currentNotification.id);
        onRefresh();
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
        const { updateAppointmentStatus } = useSupabaseData();
        await updateAppointmentStatus(currentNotification.id, 'cancelled');
        
        toast({
          title: "Agendamento Recusado",
          description: `Agendamento de ${currentNotification.client?.name} foi cancelado.`,
        });
        
        setShowNotification(false);
        setCurrentNotification(null);
        clearNotification(currentNotification.id);
        onRefresh();
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

  if (!salon) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminCalendarView 
        appointments={appointments}
        onRefresh={onRefresh}
        salonId={salon.id}
      />

      {/* Notification Modal */}
      <AppointmentNotification
        isOpen={showNotification}
        appointment={currentNotification}
        soundType={salon.notification_sound as 'default' | 'bell' | 'chime' | 'alert' || 'default'}
        onAccept={handleAcceptAppointment}
        onReject={handleRejectAppointment}
      />
    </>
  );
};

export default WeeklyCalendar;
