
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, CheckCircle2, XCircle } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';
import AppointmentStatusManager from './AppointmentStatusManager';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const AppointmentCard = ({ appointment, onUpdateAppointment, isUpdating }: AppointmentCardProps) => {
  const [showStatusManager, setShowStatusManager] = useState(false);

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

  const handleStatusUpdate = (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled', notes?: string) => {
    onUpdateAppointment(appointmentId, { status, notes });
    setShowStatusManager(false);
  };

  return (
    <>
      <Card className="mb-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xl font-bold text-foreground flex items-center">
                  <User className="h-6 w-6 mr-3 text-primary" />
                  {appointment.client?.name || appointment.client?.username || 'Cliente'}
                </h4>
                <Badge 
                  className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(appointment.status)}`}
                  onClick={() => setShowStatusManager(true)}
                >
                  {getStatusLabel(appointment.status)}
                </Badge>
              </div>
              
              <div className="space-y-3 text-lg text-muted-foreground">
                <div className="flex items-center bg-muted/50 p-3 rounded-lg">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span className="font-bold text-lg">{appointment.appointment_time} - {appointment.service?.name || 'Serviço'}</span>
                </div>
                
                {appointment.client?.phone && (
                  <div className="flex items-center bg-muted/30 p-3 rounded-lg">
                    <Phone className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-bold text-lg">{appointment.client.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center font-bold text-xl bg-success/10 p-4 rounded-lg">
                  <span className="mr-3 text-2xl">💰</span>
                  <span className="text-success text-xl">{formatCurrency(appointment.service?.price || 0)}</span>
                  <span className="text-muted-foreground ml-3 text-base font-medium">({appointment.service?.duration_minutes || 0}min)</span>
                </div>
              </div>
            </div>
          </div>

          {appointment.status === 'pending' && (
            <div className="flex gap-3 mt-4">
              <Button
                size="lg"
                onClick={() => onUpdateAppointment(appointment.id, { status: 'confirmed' })}
                disabled={isUpdating}
                className="bg-success hover:bg-success/90 text-white flex-1 font-semibold py-3"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => onUpdateAppointment(appointment.id, { status: 'cancelled' })}
                disabled={isUpdating}
                className="flex-1 font-semibold py-3"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          )}

          {appointment.status === 'confirmed' && (
            <Button
              size="lg"
              onClick={() => onUpdateAppointment(appointment.id, { status: 'completed' })}
              disabled={isUpdating}
              className="w-full mt-4 bg-primary hover:bg-primary/90 font-semibold py-3 text-lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar Atendimento
            </Button>
          )}
        </CardContent>
      </Card>

      <AppointmentStatusManager
        appointment={appointment}
        isOpen={showStatusManager}
        onClose={() => setShowStatusManager(false)}
        onUpdateStatus={handleStatusUpdate}
        isUpdating={isUpdating}
      />
    </>
  );
};

export default AppointmentCard;
