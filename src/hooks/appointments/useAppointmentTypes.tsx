
// Type helpers and normalizers for appointments
import { Appointment } from '@/types/supabase-entities';

export const useAppointmentTypes = () => {
  // Type assertion helper for appointment status
  const normalizeAppointmentStatus = (status: string): 'pending' | 'confirmed' | 'completed' | 'cancelled' => {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
    return validStatuses.includes(status as any) ? status as 'pending' | 'confirmed' | 'completed' | 'cancelled' : 'pending';
  };

  // Helper to normalize appointment data from database
  const normalizeAppointment = (rawAppointment: any): Appointment => {
    return {
      ...rawAppointment,
      status: normalizeAppointmentStatus(rawAppointment.status)
    };
  };

  return {
    normalizeAppointmentStatus,
    normalizeAppointment
  };
};
