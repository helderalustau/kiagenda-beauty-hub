
import React from 'react';
import { Appointment } from '@/types/supabase-entities';
import { useRealtimeAppointmentUpdates } from '@/hooks/useRealtimeAppointmentUpdates';
import ModernWeeklySchedule from './admin/calendar/ModernWeeklySchedule';
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
        console.log('WeeklyCalendar - Admin data:', admin);
        // Verificar se temos dados mínimos necessários
        if (admin.salon_id) {
          return { 
            salonId: admin.salon_id, 
            salon: admin.salon || { 
              id: admin.salon_id, 
              name: admin.salon_name || 'Meu Estabelecimento',
              opening_hours: admin.opening_hours || {}
            }
          };
        }
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
      console.log('WeeklyCalendar - Updating appointment:', appointmentId, updates);
      
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

  // Verificar se temos dados válidos do salon
  if (!salonId) {
    console.error('WeeklyCalendar - No salon ID found');
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro: Dados do estabelecimento não encontrados.</p>
        <p className="text-gray-600 text-sm mt-2">Faça login novamente no painel administrativo.</p>
      </div>
    );
  }

  // Criar um salon mock com horários de funcionamento padrão se não existir
  const salonWithDefaults = {
    ...salon,
    opening_hours: salon?.opening_hours && Object.keys(salon.opening_hours).length > 0 
      ? salon.opening_hours 
      : {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '08:00', close: '16:00', closed: false },
          sunday: { open: '08:00', close: '16:00', closed: true }
        }
  };

  console.log('WeeklyCalendar - Rendering with salon:', salonWithDefaults?.name, 'appointments:', appointments.length);
  console.log('WeeklyCalendar - Salon opening hours:', salonWithDefaults?.opening_hours);

  return (
    <>
      <ModernWeeklySchedule 
        appointments={appointments}
        salon={salonWithDefaults}
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
