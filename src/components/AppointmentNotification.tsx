
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Check, X, MapPin } from "lucide-react";
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
            <DialogTitle className="flex items-center space-x-2 text-orange-800 text-center">
              <Calendar className="h-6 w-6" />
              <span>🔔 Nova Solicitação de Agendamento!</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-lg">{appointment.clients?.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{appointment.clients?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-lg">{formatDate(appointment.appointment_date)}</div>
                      <div className="text-lg text-blue-600 flex items-center space-x-1">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">{formatTime(appointment.appointment_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="font-medium text-purple-700 text-lg">{appointment.services?.name}</div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="text-lg font-semibold text-green-600">
                      R$ {appointment.services?.price.toFixed(2)}
                    </span>
                    <span className="text-blue-600">
                      {appointment.services?.duration_minutes} min
                    </span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="border-t pt-3">
                    <div className="text-sm">
                      <strong className="text-gray-700">Observações do cliente:</strong>
                      <p className="mt-1 text-gray-600 italic">"{appointment.notes}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Atenção:</strong> Esta é uma solicitação de agendamento que precisa da sua aprovação.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={onReject}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="h-5 w-5" />
                <span>Recusar</span>
              </Button>
              <Button 
                onClick={onAccept}
                size="lg"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-5 w-5" />
                <span>Aprovar Agendamento</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentNotification;
