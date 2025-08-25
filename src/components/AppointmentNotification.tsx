
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 md:p-4">
      <Card className={`w-full bg-background shadow-2xl border-2 border-primary/20 animate-in fade-in-0 zoom-in-95 duration-300 ${
        isMobile ? 'max-w-sm max-h-[90vh] overflow-y-auto' : 'max-w-md'
      }`}>
        <CardHeader className={`bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg ${
          isMobile ? 'p-2.5' : 'p-4'
        }`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 font-bold ${
              isMobile ? 'text-base' : 'text-lg'
            }`}>
              <Star className={`text-warning ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              🔔 Novo Agendamento!
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              className="text-primary-foreground hover:bg-primary/20 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className={`space-y-3 ${isMobile ? 'p-2.5' : 'p-4'}`}>
          {/* Informações do Cliente */}
          <div className={`bg-secondary/20 rounded-lg space-y-2 ${isMobile ? 'p-2' : 'p-3'}`}>
            <h3 className={`font-semibold text-foreground flex items-center gap-1.5 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              <User className="h-3 w-3 text-primary" />
              Cliente
            </h3>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <User className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                <span className={`font-medium text-foreground truncate ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {getClientName()}
                </span>
              </div>
              
              {getClientPhone() && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                  <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {getClientPhone()}
                  </span>
                </div>
              )}
              
              {getClientEmail() && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                  <span className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {getClientEmail()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Serviços Solicitados */}
          <div className={`bg-accent/10 rounded-lg border border-accent/20 ${
            isMobile ? 'p-2' : 'p-3'
          }`}>
            <h3 className={`font-semibold text-foreground flex items-center gap-1.5 mb-2 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              <Scissors className="h-3 w-3 text-accent" />
              Serviços
            </h3>
            
            {/* Serviço Principal */}
            <div className="bg-background rounded-lg p-2 border border-border mb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className={`font-medium text-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {(appointment.service as any)?.name || 'Serviço'}
                  </h4>
                  <div className={`text-muted-foreground mt-0.5 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    {(appointment.service as any)?.duration_minutes || 0} min
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {formatCurrency(mainServicePrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Serviços Adicionais */}
            {additionalServices.length > 0 && (
              <div className="space-y-1.5">
                <h4 className={`font-medium text-foreground flex items-center gap-1 ${
                  isMobile ? 'text-[10px]' : 'text-xs'
                }`}>
                  <Plus className="h-2.5 w-2.5" />
                  Adicionais
                </h4>
                {additionalServices.map((service, index) => (
                  <div key={index} className="bg-background rounded-lg p-1.5 border border-border">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className={`font-medium text-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                          {service.name}
                        </span>
                        <div className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                          {service.duration} min
                        </div>
                      </div>
                      <div className={`font-semibold text-primary ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data e Horário do Agendamento */}
          <div className={`bg-primary/10 rounded-lg border border-primary/20 ${
            isMobile ? 'p-2' : 'p-3'
          }`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="h-3 w-3 text-primary" />
              <span className={`font-semibold text-foreground ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Data e Horário</span>
            </div>
            <div className="space-y-1">
              <div className={`font-bold text-foreground ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                {(() => {
                  const [year, month, day] = appointment.appointment_date.split('-');
                  return `${day}/${month}/${year}`;
                })()}
              </div>
              <div className={`flex items-center gap-1.5 font-semibold text-primary ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                <Clock className="h-3 w-3" />
                {appointment.appointment_time}
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className={`bg-accent/10 rounded-lg border border-accent/30 ${
            isMobile ? 'p-2' : 'p-3'
          }`}>
            <h3 className={`font-semibold text-foreground mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              💰 Total
            </h3>
            
            <div className="space-y-1">
              {/* Serviço Principal */}
              <div className="flex justify-between items-center">
                <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  Serviço principal
                </span>
                <span className={`font-semibold text-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  {formatCurrency(mainServicePrice)}
                </span>
              </div>

              {/* Serviços Adicionais */}
              {additionalServices.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    Adicionais ({additionalServices.length})
                  </span>
                  <span className={`font-semibold text-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    {formatCurrency(additionalServicesTotal)}
                  </span>
                </div>
              )}

              {/* Linha divisória */}
              <div className="border-t border-border my-1"></div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <div>
                  <span className={`font-bold text-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    TOTAL
                  </span>
                  <div className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                    {totalDuration} min
                  </div>
                </div>
                <span className={`font-bold text-primary ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Observações do Cliente */}
          {clientNotes && (
            <div className={`bg-muted/30 rounded-lg border ${
              isMobile ? 'p-1.5' : 'p-2'
            }`}>
              <span className={`font-medium text-foreground ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Observações:</span>
              <p className={`text-muted-foreground mt-0.5 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>{clientNotes}</p>
            </div>
          )}

          <Badge variant="secondary" className={`w-full justify-center bg-warning/20 text-warning-foreground border-warning/30 ${
            isMobile ? 'py-1 text-xs' : 'py-1.5 text-sm'
          }`}>
            ⏳ Aguardando aprovação
          </Badge>

          {/* Botões de Ação */}
          <div className={`flex gap-2 ${isMobile ? 'pt-1' : 'pt-2'}`}>
            <Button 
              onClick={onReject}
              variant="outline" 
              className={`flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 ${
                isMobile ? 'text-xs py-1.5 h-8' : 'text-sm py-2 h-9'
              }`}
            >
              ❌ Recusar
            </Button>
            <Button 
              onClick={onAccept}
              className={`flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold ${
                isMobile ? 'text-xs py-1.5 h-8' : 'text-sm py-2 h-9'
              }`}
            >
              {isMobile ? '✅ Aceitar' : '✅ Aceitar Agendamento'}
            </Button>
          </div>
          
          <p className={`text-muted-foreground text-center ${
            isMobile ? 'text-[10px] pt-1' : 'text-xs pt-1'
          }`}>
            Solicitado em {format(new Date(appointment.created_at || ''), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentNotification;
