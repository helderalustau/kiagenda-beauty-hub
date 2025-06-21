
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Check, X, MapPin, Sparkles } from "lucide-react";
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
        <DialogContent className="sm:max-w-lg border-4 border-gradient-to-r from-orange-400 to-pink-400 bg-gradient-to-br from-orange-50 to-pink-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-3 text-2xl text-orange-800 mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-full p-3 animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent font-bold">
                🔔 Nova Solicitação de Agendamento!
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Client Information Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{appointment.clients?.name}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-lg">{appointment.clients?.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-700">{appointment.services?.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                        {formatCurrency(appointment.services?.price || 0)}
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-300 text-sm">
                        {appointment.services?.duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {formatDate(appointment.appointment_date)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {formatTime(appointment.appointment_time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {appointment.notes && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">💭</span> Observações do cliente:
                </h4>
                <p className="text-gray-600 italic bg-white p-3 rounded-lg border-l-4 border-blue-400">
                  "{appointment.notes}"
                </p>
              </div>
            )}

            {/* Alert Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-400 rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <p className="text-yellow-800 font-medium">
                  <strong>Atenção:</strong> Esta solicitação precisa da sua aprovação para ser confirmada.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4">
              <Button 
                onClick={onReject}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50 px-8 py-3 rounded-xl font-semibold"
              >
                <X className="h-5 w-5" />
                <span>Recusar</span>
              </Button>
              <Button 
                onClick={onAccept}
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg px-8 py-3 rounded-xl font-semibold"
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
