
import React from 'react';
import { Appointment } from '@/types/supabase-entities';
import OptimizedAdminCalendarView from './admin/OptimizedAdminCalendarView';
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

  // Pegar salon ID do localStorage
  const getSalonId = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        return admin.salon_id;
      } catch (error) {
        console.error('Error parsing adminAuth:', error);
      }
    }
    return null;
  };

  const salonId = getSalonId();

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

  return (
    <>
      <OptimizedAdminCalendarView 
        appointments={appointments}
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
