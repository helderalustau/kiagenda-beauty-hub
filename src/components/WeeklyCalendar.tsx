
import React from 'react';
import { Appointment } from '@/types/supabase-entities';
import { useRealtimeAppointmentUpdates } from '@/hooks/useRealtimeAppointmentUpdates';
import WeeklyScheduleView from './admin/WeeklyScheduleView';
import RealtimeBookingNotification from './admin/RealtimeBookingNotification';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/hooks/use-toast";

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onRefresh: () => Promise<void>;
}

const WeeklyCalendar = ({ appointments, onRefresh }: WeeklyCalendarProps) => {
  const { updateAppointmentStatus } = useAppointmentData();
  const { toast } = useToast();

  // Pegar salon e admin data do localStorage
  const getSalonData = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        return { salonId: admin.salon_id, salon: admin.salon };
      } catch (error) {
        console.error('Error parsing adminAuth:', error);
      }
    }
    return { salonId: null, salon: null };
  };

  const { salonId, salon } = getSalonData();

  // Setup realtime updates for salon appointments
  useRealtimeAppointmentUpdates({
    salonId,
    onAppointmentUpdate: onRefresh
  });

  const handleUpdateAppointment = async (appointmentId: string, updates: { status: string; notes?: string }) => {
    try {
      const result = await updateAppointmentStatus(appointmentId, updates.status as any);
      
      if (result.success) {
        toast({
          title: "✅ Agendamento Atualizado!",
          description: `Status alterado para ${updates.status}`,
        });
        
        onRefresh();
      } else {
        toast({
          title: "Erro ao Atualizar",
          description: result.message || "Erro ao atualizar agendamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar agendamento",
        variant: "destructive"
      });
    }
  };

  if (!salon) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Carregando dados do estabelecimento...</p>
      </div>
    );
  }

  return (
    <>
      <WeeklyScheduleView 
        appointments={appointments}
        salon={salon}
        onUpdateAppointment={handleUpdateAppointment}
        isUpdating={false}
      />

      {/* Componente de notificação em tempo real */}
      {salonId && (
        <RealtimeBookingNotification
          salonId={salonId}
          onAppointmentUpdate={onRefresh}
        />
      )}
    </>
  );
};

export default WeeklyCalendar;
