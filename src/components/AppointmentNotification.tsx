
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Check, X } from "lucide-react";
import NotificationSounds from './NotificationSounds';

interface AppointmentNotificationProps {
  isOpen: boolean;
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
    clients?: {
      name: string;
      phone: string;
    };
    services?: {
      name: string;
      price: number;
      duration_minutes: number;
    };
  } | null;
  soundType: 'default' | 'bell' | 'chime' | 'alert';
  onAccept: () => void;
  onReject: () => void;
}

const AppointmentNotification = ({ 
  isOpen, 
  appointment, 
  soundType, 
  onAccept, 
  onReject 
}: AppointmentNotificationProps) => {
  if (!appointment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <>
      <NotificationSounds 
        soundType={soundType}
        isPlaying={isOpen}
        onStop={() => {}}
      />
      
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-4 border-orange-400 bg-orange-50">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-orange-800">
              <Calendar className="h-6 w-6" />
              <span>🔔 Novo Agendamento!</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">{appointment.clients?.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{appointment.clients?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(appointment.appointment_time)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="font-medium text-purple-700">{appointment.services?.name}</div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>R$ {appointment.services?.price.toFixed(2)}</span>
                    <span>{appointment.services?.duration_minutes} min</span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600">
                      <strong>Observações:</strong> {appointment.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={onReject}
                variant="outline"
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                <span>Recusar</span>
              </Button>
              <Button 
                onClick={onAccept}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                <span>Aceitar Agendamento</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentNotification;
