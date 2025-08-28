
import React from 'react';
import EnhancedAppointmentCard from './EnhancedAppointmentCard';
import { Appointment } from '@/types/supabase-entities';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => Promise<boolean>;
  isUpdating: boolean;
}

const AppointmentCard = ({ appointment, onUpdateAppointment, isUpdating }: AppointmentCardProps) => {
  return (
    <EnhancedAppointmentCard
      appointment={appointment}
      onUpdateAppointment={onUpdateAppointment}
      isUpdating={isUpdating}
    />
  );
};

export default AppointmentCard;
