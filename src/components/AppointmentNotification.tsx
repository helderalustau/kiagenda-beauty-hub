
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Clock, User, Phone, MapPin, Star, Scissors, Plus } from "lucide-react";
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

  const parseAdditionalServices = (notes: string): Array<{name: string, duration: number, price: number}> => {
    if (!notes) return [];
    
    const additionalServicesMatch = notes.match(/Serviços Adicionais:\s*(.+?)(?:\n\n|$)/s);
    if (!additionalServicesMatch) return [];
    
    const servicesText = additionalServicesMatch[1];
    const serviceMatches = servicesText.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/g);
    
    if (!serviceMatches) return [];
    
    return serviceMatches.map(match => {
      const parts = match.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/);
      if (!parts) return null;
      
      return {
        name: parts[1].trim(),
        duration: parseInt(parts[2]),
        price: parseFloat(parts[3].replace(',', ''))
      };
    }).filter(Boolean);
  };

  const getClientNotes = (notes: string): string => {
    if (!notes) return '';
    
    const additionalServicesIndex = notes.indexOf('Serviços Adicionais:');
    if (additionalServicesIndex === -1) return notes;
    
    return notes.substring(0, additionalServicesIndex).trim();
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

  const additionalServices = parseAdditionalServices(appointment.notes || '');
  const clientNotes = getClientNotes(appointment.notes || '');
  const mainServicePrice = (appointment.service as any)?.price || 0;
  const additionalServicesTotal = additionalServices.reduce((sum, service) => sum + service.price, 0);
  const totalPrice = mainServicePrice + additionalServicesTotal;
  const totalDuration = ((appointment.service as any)?.duration_minutes || 0) + 
    additionalServices.reduce((sum, service) => sum + service.duration, 0);

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

          {/* Serviços Solicitados */}
          <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <h3 className={`font-semibold text-purple-900 flex items-center gap-2 mb-3 ${
              isMobile ? 'text-sm' : 'text-base'
            }`}>
              <Scissors className="h-4 w-4" />
              Serviços Solicitados
            </h3>
            
            {/* Serviço Principal */}
            <div className="bg-white rounded-lg p-3 border border-purple-100 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className={`font-medium text-purple-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {(appointment.service as any)?.name || 'Serviço'}
                  </h4>
                  <div className={`text-purple-600 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {(appointment.service as any)?.duration_minutes || 0} minutos
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-green-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {formatCurrency(mainServicePrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Serviços Adicionais */}
            {additionalServices.length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-medium text-purple-800 flex items-center gap-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <Plus className="h-3 w-3" />
                  Serviços Adicionais
                </h4>
                {additionalServices.map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-purple-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className={`font-medium text-purple-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {service.name}
                        </span>
                        <div className={`text-purple-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {service.duration} minutos
                        </div>
                      </div>
                      <div className={`font-semibold text-green-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          {/* Resumo Financeiro */}
          <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <h3 className={`font-semibold text-green-900 mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Resumo Financeiro
            </h3>
            
            <div className="space-y-2">
              {/* Serviço Principal */}
              <div className="flex justify-between items-center">
                <span className={`text-green-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Serviço principal
                </span>
                <span className={`font-semibold text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {formatCurrency(mainServicePrice)}
                </span>
              </div>

              {/* Serviços Adicionais */}
              {additionalServices.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className={`text-green-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Serviços adicionais ({additionalServices.length})
                  </span>
                  <span className={`font-semibold text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {formatCurrency(additionalServicesTotal)}
                  </span>
                </div>
              )}

              {/* Linha divisória */}
              <div className="border-t border-green-300 my-2"></div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <div>
                  <span className={`font-bold text-green-900 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                    Total
                  </span>
                  <div className={`text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Duração: {totalDuration} min
                  </div>
                </div>
                <span className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Observações do Cliente */}
          {clientNotes && (
            <div className={`bg-gray-50 rounded-lg border ${
              isMobile ? 'p-2' : 'p-3'
            }`}>
              <span className={`font-medium text-gray-700 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>Observações:</span>
              <p className={`text-gray-900 mt-1 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>{clientNotes}</p>
            </div>
          )}

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
