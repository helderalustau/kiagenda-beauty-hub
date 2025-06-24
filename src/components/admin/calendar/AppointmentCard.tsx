
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, CheckCircle2, XCircle } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const AppointmentCard = ({ appointment, onUpdateAppointment, isUpdating }: AppointmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                {appointment.client?.name || appointment.client?.username || 'Cliente'}
              </h4>
              <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2" />
                <span>{appointment.appointment_time} - {appointment.service?.name || 'Serviço'}</span>
              </div>
              
              {appointment.client?.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-2" />
                  <span>{appointment.client.phone}</span>
                </div>
              )}
              
              <div className="flex items-center font-medium text-green-600">
                <span className="mr-2">💰</span>
                <span>{formatCurrency(appointment.service?.price || 0)}</span>
                <span className="text-gray-500 ml-2">({appointment.service?.duration_minutes || 0}min)</span>
              </div>
            </div>
          </div>
        </div>

        {appointment.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => onUpdateAppointment(appointment.id, { status: 'confirmed' })}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdateAppointment(appointment.id, { status: 'cancelled' })}
              disabled={isUpdating}
              className="flex-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <Button
            size="sm"
            onClick={() => onUpdateAppointment(appointment.id, { status: 'completed' })}
            disabled={isUpdating}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Finalizar Atendimento
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
