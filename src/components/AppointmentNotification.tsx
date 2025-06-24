
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Clock, User, Phone, MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface AppointmentNotificationProps {
  isOpen: boolean;
  appointment: Appointment | null;
  soundType: 'default' | 'bell' | 'chime' | 'alert';
  onAccept: () => void;
  onReject: () => void;
}

const AppointmentNotification = ({ 
  isOpen, 
  appointment, 
  soundType = 'default',
  onAccept, 
  onReject 
}: AppointmentNotificationProps) => {
  useEffect(() => {
    if (isOpen && appointment) {
      // Play notification sound based on type
      const audio = new Audio();
      switch (soundType) {
        case 'bell':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCEWm5fK/bS...';
          break;
        case 'chime':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCEWm5fK/bS...';
          break;
        case 'alert':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCEWm5fK/bS...';
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCEWm5fK/bS...';
      }
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Não foi possível reproduzir o som:', e));
    }
  }, [isOpen, appointment, soundType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-blue-200 animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-300" />
              Novo Agendamento!
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              className="text-white hover:bg-blue-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Informações do Cliente */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Informações do Cliente
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {appointment.client?.name || appointment.client?.username || 'Cliente'}
                </span>
              </div>
              
              {appointment.client?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">{appointment.client.phone}</span>
                </div>
              )}
              
              {appointment.client?.email && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">{appointment.client.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalhes do Agendamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Serviço:</span>
              <span className="font-semibold text-gray-900">{appointment.service?.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Valor:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(appointment.service?.price || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Duração:</span>
              <span className="text-gray-900">{appointment.service?.duration_minutes} min</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{appointment.appointment_time}</span>
            </div>
            
            {appointment.notes && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700">Observações:</span>
                <p className="text-gray-900 mt-1">{appointment.notes}</p>
              </div>
            )}
          </div>

          <Badge variant="secondary" className="w-full justify-center bg-yellow-100 text-yellow-800">
            Aguardando sua aprovação
          </Badge>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onReject}
              variant="outline" 
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              Recusar
            </Button>
            <Button 
              onClick={onAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Aceitar Agendamento
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center pt-2">
            Solicitado em {format(new Date(appointment.created_at || ''), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentNotification;
