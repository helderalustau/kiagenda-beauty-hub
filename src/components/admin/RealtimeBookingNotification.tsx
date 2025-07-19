
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Phone, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Appointment } from '@/types/supabase-entities';

interface RealtimeBookingNotificationProps {
  salonId: string;
  onAppointmentUpdate?: () => void;
  enablePageRefresh?: boolean;
}

const RealtimeBookingNotification = ({ salonId, onAppointmentUpdate, enablePageRefresh = true }: RealtimeBookingNotificationProps) => {
  const { toast } = useToast();
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertAudio, setAlertAudio] = useState<HTMLAudioElement | null>(null);

  // Função para buscar agendamentos pendentes iniciais
  const fetchPendingAppointments = async () => {
    if (!salonId) return;

    setIsLoading(true);
    console.log('📋 Fetching initial pending appointments for salon:', salonId);

    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .eq('salon_id', salonId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending appointments:', error);
      } else {
        setPendingAppointments(appointments as Appointment[] || []);
        console.log(`📋 Found ${appointments?.length || 0} pending appointments`);
        
        // Se há agendamentos pendentes, mostrar o primeiro
        if (appointments && appointments.length > 0) {
          setCurrentAppointment(appointments[0] as Appointment);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!salonId) return;

    // Buscar agendamentos pendentes iniciais
    fetchPendingAppointments();

    console.log('🔔 Setting up realtime booking notifications for salon:', salonId);

    const channel = supabase
      .channel(`booking-notifications-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('🆕 New appointment received:', payload);
          
          if (payload.new.status === 'pending') {
            // Buscar dados completos do agendamento
            const { data: appointment, error } = await supabase
              .from('appointments')
              .select(`
                *,
                salon:salons(id, name, address, phone),
                service:services(id, name, price, duration_minutes),
                client:client_auth(id, username, name, phone, email)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching appointment details:', error);
              return;
            }

            if (appointment) {
              const newAppointment = appointment as Appointment;
              
              // Adicionar à lista de agendamentos pendentes
              setPendingAppointments(prev => [newAppointment, ...prev]);
              
              // Se não há nenhum dialog aberto, mostrar este agendamento
              if (!isOpen) {
                setCurrentAppointment(newAppointment);
                setIsOpen(true);
              }
              
              // Som de alerta contínuo
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCEWm5fK/bS==');
                audio.loop = true;
                audio.volume = 0.5;
                audio.play().catch(() => {});
                setAlertAudio(audio);
              } catch (error) {
                // Ignorar erro de áudio
              }

              toast({
                title: "🔔 Nova Solicitação de Agendamento!",
                description: `${appointment.client?.name || appointment.client?.username} solicitou ${appointment.service?.name}`,
                duration: 8000,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('📝 Appointment updated:', payload);
          
          // Notificação instantânea como o IFOOD
          if (payload.new.status === 'pending') {
            console.log('🔔 Novo agendamento pendente - exibindo instantaneamente!');
            // Mostrar imediatamente na tela
            toast({
              title: "🔔 Novo Agendamento!",
              description: "Você tem um novo agendamento pendente",
              variant: "default",
            });
          }
          
          // Refresh da página quando detectar mudanças na agenda
          if (enablePageRefresh && payload.old.status !== payload.new.status) {
            console.log('🔄 Agenda alterada, fazendo refresh da página...');
            setTimeout(() => {
              window.location.reload();
            }, 1000); // Reduzindo para 1 segundo para resposta mais rápida
            return;
          }
          
          // Se um agendamento foi atualizado para pending, adicionar à lista
          if (payload.new.status === 'pending' && payload.old.status !== 'pending') {
            const { data: appointment, error } = await supabase
              .from('appointments')
              .select(`
                *,
                salon:salons(id, name, address, phone),
                service:services(id, name, price, duration_minutes),
                client:client_auth(id, username, name, phone, email)
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && appointment) {
              const updatedAppointment = appointment as Appointment;
              setPendingAppointments(prev => [updatedAppointment, ...prev]);
              
              if (!isOpen) {
                setCurrentAppointment(updatedAppointment);
                setIsOpen(true);
              }
            }
          }
          
          // Se um agendamento foi removido do status pending, remover da lista
          if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
            setPendingAppointments(prev => prev.filter(apt => apt.id !== payload.new.id));
            
            // Se era o agendamento atual sendo mostrado, fechar o dialog
            if (currentAppointment?.id === payload.new.id) {
              setIsOpen(false);
              setCurrentAppointment(null);
              
              // Parar som de alerta
              if (alertAudio) {
                alertAudio.pause();
                alertAudio.currentTime = 0;
                setAlertAudio(null);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
      
      // Parar som de alerta se houver
      if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
      }
    };
  }, [salonId, toast, isOpen, currentAppointment, alertAudio]);

  const handleApprove = async () => {
    if (!currentAppointment || isProcessing) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', currentAppointment.id);

      if (error) {
        console.error('Error approving appointment:', error);
        toast({
          title: "Erro",
          description: "Erro ao confirmar agendamento",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "✅ Agendamento Confirmado!",
        description: `Agendamento de ${currentAppointment.client?.name || currentAppointment.client?.username} foi confirmado`,
      });

      // Remover da lista de pendentes
      setPendingAppointments(prev => prev.filter(apt => apt.id !== currentAppointment.id));
      
      // Parar som de alerta
      if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
        setAlertAudio(null);
      }
      
      // Mostrar próximo agendamento pendente, se houver
      const remainingAppointments = pendingAppointments.filter(apt => apt.id !== currentAppointment.id);
      if (remainingAppointments.length > 0) {
        setCurrentAppointment(remainingAppointments[0]);
      } else {
        setIsOpen(false);
        setCurrentAppointment(null);
      }
      
      onAppointmentUpdate?.();

    } catch (error) {
      console.error('Error approving appointment:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao confirmar agendamento",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentAppointment || isProcessing) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          notes: currentAppointment.notes ? `${currentAppointment.notes} | Agendamento recusado pelo estabelecimento` : 'Agendamento recusado pelo estabelecimento'
        })
        .eq('id', currentAppointment.id);

      if (error) {
        console.error('Error rejecting appointment:', error);
        toast({
          title: "Erro",
          description: "Erro ao recusar agendamento",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "❌ Agendamento Recusado",
        description: `Agendamento de ${currentAppointment.client?.name || currentAppointment.client?.username} foi recusado`,
      });

      // Remover da lista de pendentes
      setPendingAppointments(prev => prev.filter(apt => apt.id !== currentAppointment.id));
      
      // Parar som de alerta
      if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
        setAlertAudio(null);
      }
      
      // Mostrar próximo agendamento pendente, se houver
      const remainingAppointments = pendingAppointments.filter(apt => apt.id !== currentAppointment.id);
      if (remainingAppointments.length > 0) {
        setCurrentAppointment(remainingAppointments[0]);
      } else {
        setIsOpen(false);
        setCurrentAppointment(null);
      }
      
      onAppointmentUpdate?.();

    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao recusar agendamento",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mostrar loading durante carregamento inicial
  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Carregando agendamentos...</span>
        </div>
      </div>
    );
  }

  if (!currentAppointment) return null;

  return (
    <>
      {/* Indicador de agendamentos pendentes na fila */}
      {pendingAppointments.length > 1 && (
        <div className="fixed top-4 right-4 bg-orange-100 border border-orange-200 rounded-lg p-2 z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-orange-700 font-medium">
              {pendingAppointments.length} agendamentos na fila
            </span>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-blue-900">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Nova Solicitação de Agendamento!</span>
              </div>
              {pendingAppointments.length > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingAppointments.indexOf(currentAppointment) + 1} de {pendingAppointments.length}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{currentAppointment.client?.name || currentAppointment.client?.username}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>{currentAppointment.client?.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>
                  {(() => {
                    const [year, month, day] = currentAppointment.appointment_date.split('-');
                    return `${day}/${month}/${year}`;
                  })()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{currentAppointment.appointment_time}</span>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-900">{currentAppointment.service?.name}</p>
                <p className="text-sm text-gray-600">
                  {currentAppointment.service?.duration_minutes} min - R$ {currentAppointment.service?.price}
                </p>
              </div>

              {currentAppointment.notes && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm text-gray-700"><strong>Observações:</strong> {currentAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Aguardando aprovação
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
            
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isProcessing ? 'Recusando...' : 'Recusar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RealtimeBookingNotification;
