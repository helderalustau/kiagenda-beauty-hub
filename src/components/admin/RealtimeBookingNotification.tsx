
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Phone, Calendar, CheckCircle, XCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Appointment } from '@/types/supabase-entities';

interface RealtimeBookingNotificationProps {
  salonId: string;
  onAppointmentUpdate?: () => void;
}

const RealtimeBookingNotification = ({ salonId, onAppointmentUpdate }: RealtimeBookingNotificationProps) => {
  const { toast } = useToast();
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!salonId) return;

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
              setPendingAppointment(appointment as Appointment);
              setIsOpen(true);
              
              // Som de notificação
              try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(() => {});
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
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [salonId, toast]);

  const handleApprove = async () => {
    if (!pendingAppointment || isProcessing) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', pendingAppointment.id);

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
        description: `Agendamento de ${pendingAppointment.client?.name || pendingAppointment.client?.username} foi confirmado`,
      });

      setIsOpen(false);
      setPendingAppointment(null);
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
    if (!pendingAppointment || isProcessing) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          notes: 'Agendamento recusado pelo estabelecimento'
        })
        .eq('id', pendingAppointment.id);

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
        description: `Agendamento de ${pendingAppointment.client?.name || pendingAppointment.client?.username} foi recusado`,
      });

      setIsOpen(false);
      setPendingAppointment(null);
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

  if (!pendingAppointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-blue-900">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span>Nova Solicitação de Agendamento!</span>
          </DialogTitle>
        </DialogHeader>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{pendingAppointment.client?.name || pendingAppointment.client?.username}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>{pendingAppointment.client?.phone}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>
                {new Date(pendingAppointment.appointment_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{pendingAppointment.appointment_time}</span>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-gray-900">{pendingAppointment.service?.name}</p>
              <p className="text-sm text-gray-600">
                {pendingAppointment.service?.duration_minutes} min - R$ {pendingAppointment.service?.price}
              </p>
            </div>

            {pendingAppointment.notes && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-700"><strong>Observações:</strong> {pendingAppointment.notes}</p>
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
  );
};

export default RealtimeBookingNotification;
