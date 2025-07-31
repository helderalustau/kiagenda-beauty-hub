
import { useState } from 'react';
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentFetch } from './appointments/useAppointmentFetch';
import { useAppointmentCreate } from './appointments/useAppointmentCreate';
import { useAppointmentUpdate } from './appointments/useAppointmentUpdate';

export const useAppointmentData = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const fetchHook = useAppointmentFetch();
  const createHook = useAppointmentCreate();
  const updateHook = useAppointmentUpdate();

  // Combine loading states
  const loading = fetchHook.loading || createHook.loading || updateHook.loading;

  // Wrapper functions that also update local state
  const fetchAllAppointments = async (salonId: string, includeDeleted: boolean = false) => {
    console.log('📋 Buscando agendamentos para salon:', salonId, 'includeDeleted:', includeDeleted);
    
    const result = await fetchHook.fetchAllAppointments(salonId, includeDeleted);
    
    console.log('📋 Resultado da busca:', {
      success: result.success,
      dataLength: result.data?.length || 0,
      data: result.data
    });
    
    if (result.success) {
      setAppointments(result.data);
      console.log('✅ Agendamentos atualizados no estado local:', result.data.length);
    } else {
      console.error('❌ Erro ao buscar agendamentos:', result.message);
    }
    
    return result;
  };

  const fetchClientAppointments = async (clientId: string) => {
    console.log('📋 Buscando agendamentos do cliente:', clientId);
    
    const result = await fetchHook.fetchClientAppointments(clientId);
    
    console.log('📋 Resultado da busca do cliente:', {
      success: result.success,
      dataLength: result.data?.length || 0
    });
    
    if (result.success) {
      setAppointments(result.data);
    }
    return result;
  };

  const createAppointment = async (appointmentData: any) => {
    console.log('➕ Criando novo agendamento:', appointmentData);
    
    const result = await createHook.createAppointment(appointmentData);
    
    if (result.success && result.appointment) {
      console.log('✅ Agendamento criado com sucesso:', result.appointment);
      setAppointments(prev => [result.appointment, ...prev]);
    } else {
      console.error('❌ Erro ao criar agendamento:', result.message);
    }
    
    return result;
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled', reason?: string) => {
    console.log('📝 Atualizando status do agendamento:', { appointmentId, status, reason });
    
    const result = await updateHook.updateAppointmentStatus(appointmentId, status, reason);
    
    if (result.success && result.appointment) {
      console.log('✅ Status atualizado com sucesso:', result.appointment);
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId ? result.appointment : appointment
      ));
    } else {
      console.error('❌ Erro ao atualizar status:', result.message);
    }
    
    return result;
  };

  const restoreAppointment = async (appointmentId: string) => {
    console.log('🔄 Restaurando agendamento:', appointmentId);
    
    const result = await updateHook.restoreAppointment(appointmentId);
    
    if (result.success && result.appointment) {
      console.log('✅ Agendamento restaurado com sucesso:', result.appointment);
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId ? result.appointment : appointment
      ));
    } else {
      console.error('❌ Erro ao restaurar agendamento:', result.message);
    }
    
    return result;
  };

  const deleteAppointment = async (appointmentId: string) => {
    console.log('🗑️ Deletando agendamento:', appointmentId);
    
    const result = await updateHook.deleteAppointment(appointmentId);
    
    if (result.success) {
      console.log('✅ Agendamento deletado com sucesso');
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
    } else {
      console.error('❌ Erro ao deletar agendamento:', result.message);
    }
    
    return result;
  };

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointmentStatus,
    fetchAllAppointments,
    restoreAppointment,
    fetchClientAppointments,
    deleteAppointment,
    setAppointments
  };
};
