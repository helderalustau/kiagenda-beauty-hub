
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, User, Phone, Calendar } from "lucide-react";
import { Appointment } from '@/hooks/useSupabaseData';

interface AppointmentNotificationPopupProps {
  appointments: Appointment[];
  onClose: (appointmentId: string) => void;
  onClearAll: () => void;
  onViewAppointment?: (appointment: Appointment) => void;
}

const AppointmentNotificationPopup = ({
  appointments,
  onClose,
  onClearAll,
  onViewAppointment
}: AppointmentNotificationPopupProps) => {
  if (appointments.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {appointments.length > 1 && (
        <div className="flex justify-end">
          <Button
            onClick={onClearAll}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Limpar todas ({appointments.length})
          </Button>
        </div>
      )}
      
      {appointments.slice(0, 3).map((appointment) => (
        <Card key={appointment.id} className="bg-blue-50 border-blue-200 shadow-lg animate-in slide-in-from-right">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-blue-900">
                🔔 Nova Solicitação!
              </CardTitle>
              <Button
                onClick={() => onClose(appointment.id)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{appointment.client?.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{appointment.client?.phone}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{appointment.appointment_time}</span>
            </div>
            
            <div className="bg-white p-2 rounded border">
              <p className="text-sm font-medium">{appointment.service?.name}</p>
              <p className="text-xs text-gray-600">
                {appointment.service?.duration_minutes} min - R$ {appointment.service?.price}
              </p>
            </div>

            {appointment.notes && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-700">{appointment.notes}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Aguardando aprovação
              </Badge>
              
              {onViewAppointment && (
                <Button
                  onClick={() => onViewAppointment(appointment)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ver detalhes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {appointments.length > 3 && (
        <Card className="bg-gray-100 border-gray-200">
          <CardContent className="p-3 text-center">
            <p className="text-sm text-gray-600">
              +{appointments.length - 3} mais solicitações...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentNotificationPopup;
