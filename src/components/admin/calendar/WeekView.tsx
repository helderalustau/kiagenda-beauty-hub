
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import AppointmentCard from './AppointmentCard';

interface WeekViewProps {
  weekDays: Date[];
  appointmentsByDate: { [key: string]: Appointment[] };
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const WeekView = ({ weekDays, appointmentsByDate, onUpdateAppointment, isUpdating }: WeekViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
      {weekDays.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayAppointments = appointmentsByDate[dateKey] || [];
        
        return (
          <div key={dateKey} className="space-y-2">
            <div className={`text-center p-2 rounded-lg ${isToday(day) ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}>
              <div className="font-semibold">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className="text-sm">
                {format(day, 'dd/MM')}
              </div>
              {dayAppointments.length > 0 && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {dayAppointments.length}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dayAppointments.map(appointment => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  onUpdateAppointment={onUpdateAppointment}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
