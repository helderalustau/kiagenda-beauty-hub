import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Clock, User, Phone, MapPin, Star, Scissors } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && appointment) {
      // Play notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configurar frequências diferentes para cada tipo de som
        switch (soundType) {
          case 'bell':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
            break;
          case 'chime':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
            break;
          case 'alert':
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
            break;
          default: // default
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        }

        oscillator.type = 'sine';
        
        // Envelope para suavizar o som
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        console.log('🔊 Som de notificação tocado:', soundType);
      } catch (error) {
        console.log('Não foi possível reproduzir o som:', error);
      }
    }
  }, [isOpen, appointment, soundType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isOpen || !appointment) return null;

  const getClientName = () => {
    if ((appointment as any).client?.name) return (appointment as any).client.name;
    if ((appointment as any).client_auth?.name) return (appointment as any).client_auth.name;
    if ((appointment as any).client?.username) return (appointment as any).client.username;
    return 'Cliente';
  };

  const getClientPhone = () => {
    if ((appointment as any).client?.phone) return (appointment as any).client.phone;
    if ((appointment as any).client_auth?.phone) return (appointment as any).client_auth.phone;
    return null;
  };

  const getClientEmail = () => {
    if ((appointment as any).client?.email) return (appointment as any).client.email;
    if ((appointment as any).client_auth?.email) return (appointment as any).client_auth.email;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <Card className={`w-full bg-white shadow-2xl border-2 border-blue-200 animate-in fade-in-0 zoom-in-95 duration-300 ${
        isMobile ? 'max-w-sm max-h-[90vh] overflow-y-auto' : 'max-w-lg'
      }`}>
        <CardHeader className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg ${
          isMobile ? 'p-3' : 'p-6'
        }`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              <Star className={`text-yellow-300 ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
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
        
        <CardContent className={`space-y-4 ${isMobile ? 'p-3' : 'p-6'}`}>
          {/* Informações do Cliente */}
          <div className={`bg-slate-50 rounded-lg space-y-2 ${isMobile ? 'p-3' : 'p-4'}`}>
            <h3 className={`font-semibold text-slate-900 flex items-center gap-2 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
              <User className="h-4 w-4 text-blue-500" />
              Informações do Cliente
            </h3>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className={`font-medium text-slate-900 truncate ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>
                  {getClientName()}
                </span>
              </div>
              
              {getClientPhone() && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <span className={`text-slate-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {getClientPhone()}
                  </span>
                </div>
              )}
              
              {getClientEmail() && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <span className={`text-slate-700 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {getClientEmail()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Detalhes do Agendamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`font-medium text-slate-700 flex items-center gap-2 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                <Scissors className="h-4 w-4 flex-shrink-0" />
                Serviço:
              </span>
              <span className={`font-semibold text-slate-900 text-right ${
                isMobile ? 'text-sm max-w-[50%] truncate' : 'text-base'
              }`}>
                {(appointment as any).service?.name || 'Serviço'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`font-medium text-slate-700 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>Valor:</span>
              <span className={`font-semibold text-green-600 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                {formatCurrency((appointment as any).service?.price || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`font-medium text-slate-700 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>Duração:</span>
              <span className={`text-slate-900 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                {(appointment as any).service?.duration_minutes || 0} min
              </span>
            </div>
            
            {/* Data e Horário do Agendamento */}
            <div className={`bg-blue-50 rounded-lg border border-blue-200 ${
              isMobile ? 'p-3' : 'p-4'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className={`font-semibold text-blue-800 ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>Data e Horário:</span>
              </div>
              <div className="space-y-1">
                <div className={`font-bold text-blue-900 ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>
                  {(() => {
                    const [year, month, day] = appointment.appointment_date.split('-');
                    return `${day}/${month}/${year}`;
                  })()}
                </div>
                <div className={`flex items-center gap-2 font-semibold text-blue-800 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  <Clock className="h-4 w-4" />
                  {appointment.appointment_time}
                </div>
              </div>
            </div>
            
            {appointment.notes && (
              <div className={`bg-gray-50 rounded-lg border ${
                isMobile ? 'p-2' : 'p-3'
              }`}>
                <span className={`font-medium text-gray-700 ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>Observações:</span>
                <p className={`text-gray-900 mt-1 ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>{appointment.notes}</p>
              </div>
            )}
          </div>

          <Badge variant="secondary" className={`w-full justify-center bg-yellow-100 text-yellow-800 ${
            isMobile ? 'py-1 text-sm' : 'py-2'
          }`}>
            Aguardando sua aprovação
          </Badge>

          {/* Botões de Ação */}
          <div className={`flex gap-2 ${isMobile ? 'pt-2' : 'pt-4'}`}>
            <Button 
              onClick={onReject}
              variant="outline" 
              className={`flex-1 border-red-200 text-red-600 hover:bg-red-50 ${
                isMobile ? 'text-sm py-2' : ''
              }`}
            >
              Recusar
            </Button>
            <Button 
              onClick={onAccept}
              className={`flex-1 bg-green-600 hover:bg-green-700 text-white ${
                isMobile ? 'text-sm py-2' : ''
              }`}
            >
              {isMobile ? 'Aceitar' : 'Aceitar Agendamento'}
            </Button>
          </div>
          
          <p className={`text-gray-500 text-center ${
            isMobile ? 'text-xs pt-1' : 'text-xs pt-2'
          }`}>
            Solicitado em {format(new Date(appointment.created_at || ''), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentNotification;
