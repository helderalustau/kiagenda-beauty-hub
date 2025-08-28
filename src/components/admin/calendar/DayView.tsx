
import React from 'react';
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import AppointmentCard from './AppointmentCard';

interface DayViewProps {
  selectedDate: Date;
  appointmentsByDate: { [key: string]: Appointment[] };
  onDateChange: (date: Date) => void;
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => Promise<boolean>;
  isUpdating: boolean;
}

const DayView = ({ 
  selectedDate, 
  appointmentsByDate, 
  onDateChange, 
  onUpdateAppointment, 
  isUpdating 
}: DayViewProps) => {
  const dayAppointments = appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="w-auto"
        />
        <span className="font-medium">
          {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dayAppointments.map(appointment => (
          <AppointmentCard 
            key={appointment.id} 
            appointment={appointment}
            onUpdateAppointment={onUpdateAppointment}
            isUpdating={isUpdating}
          />
        ))}
      </div>
      
      {dayAppointments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum agendamento para este dia</p>
        </div>
      )}
    </div>
  );
};

export default DayView;
