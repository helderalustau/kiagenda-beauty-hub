
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Check, X, Sparkles } from "lucide-react";
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
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <NotificationSounds 
        soundType={soundType}
        isPlaying={isOpen}
        onStop={() => {}}
      />
      
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-white shadow-xl border-2 border-orange-200">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="flex items-center justify-center space-x-2 text-lg text-orange-800">
              <div className="bg-orange-500 rounded-full p-2 animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Nova Solicitação!</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Informações do Cliente */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 rounded-full p-2">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{appointment.clients?.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{appointment.clients?.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Serviço e Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="font-medium text-purple-700 mb-1">{appointment.services?.name}</h4>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {formatCurrency(appointment.services?.price || 0)}
                  </Badge>
                  <span className="text-xs text-gray-500">{appointment.services?.duration_minutes}min</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {formatDate(appointment.appointment_date)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-600" />
                  <span className="text-lg font-bold text-blue-600">
                    {formatTime(appointment.appointment_time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Observações */}
            {appointment.notes && (
              <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                <p className="text-sm text-gray-700">
                  <strong>Obs:</strong> {appointment.notes}
                </p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex space-x-3 pt-2">
              <Button 
                onClick={onReject}
                variant="outline"
                size="sm"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Recusar
              </Button>
              <Button 
                onClick={onAccept}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Aprovar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentNotification;
