
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';

interface CleanAppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
}

const CleanAppointmentCard = ({ appointment, onClick }: CleanAppointmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200 shadow-green-100';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200 shadow-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getClientName = (appointment: Appointment) => {
    if ((appointment as any).client?.name) {
      return (appointment as any).client.name;
    }
    if ((appointment as any).client_auth?.name) {
      return (appointment as any).client_auth.name;
    }
    if ((appointment as any).client?.username) {
      return (appointment as any).client.username;
    }
    return 'Cliente';
  };

  const getServiceName = (appointment: Appointment) => {
    if ((appointment as any).service?.name) {
      return (appointment as any).service.name;
    }
    if ((appointment as any).services?.name) {
      return (appointment as any).services.name;
    }
    return 'Serviço';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border ${getStatusColor(appointment.status)} bg-white/90 backdrop-blur-sm`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Horário */}
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">
            {appointment.appointment_time}
          </span>
        </div>

        {/* Cliente */}
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-medium text-gray-800 truncate">
            {getClientName(appointment)}
          </span>
        </div>

        {/* Serviço */}
        <div className="text-xs text-gray-600 truncate">
          {getServiceName(appointment)}
        </div>

        {/* Status */}
        <div className="flex justify-between items-center">
          <Badge className={`text-xs px-2 py-1 ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </Badge>
          
          {appointment.service?.duration_minutes && (
            <span className="text-xs text-gray-500">
              {appointment.service.duration_minutes}min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanAppointmentCard;
