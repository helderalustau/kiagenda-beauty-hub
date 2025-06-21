
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
    const result = await fetchHook.fetchAllAppointments(salonId, includeDeleted);
    if (result.success) {
      setAppointments(result.data);
    }
    return result;
  };

  const fetchClientAppointments = async (clientId: string) => {
    const result = await fetchHook.fetchClientAppointments(clientId);
    if (result.success) {
      setAppointments(result.data);
    }
    return result;
  };

  const createAppointment = async (appointmentData: any) => {
    const result = await createHook.createAppointment(appointmentData);
    if (result.success && result.appointment) {
      setAppointments(prev => [result.appointment, ...prev]);
    }
    return result;
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled', reason?: string) => {
    const result = await updateHook.updateAppointmentStatus(appointmentId, status, reason);
    if (result.success && result.appointment) {
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId ? result.appointment : appointment
      ));
    }
    return result;
  };

  const restoreAppointment = async (appointmentId: string) => {
    const result = await updateHook.restoreAppointment(appointmentId);
    if (result.success && result.appointment) {
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId ? result.appointment : appointment
      ));
    }
    return result;
  };

  const deleteAppointment = async (appointmentId: string) => {
    const result = await updateHook.deleteAppointment(appointmentId);
    if (result.success) {
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
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
