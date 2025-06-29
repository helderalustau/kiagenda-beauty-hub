
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Appointment } from '@/types/supabase-entities';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendingAppointmentsProps {
  clientId: string;
  appointments: Appointment[];
}

const PendingAppointments = ({ clientId, appointments }: PendingAppointmentsProps) => {
  const { toast } = useToast();
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Filtrar agendamentos pendentes
    const pending = appointments.filter(apt => apt.status === 'pending');
    setPendingAppointments(pending);

    // Setup realtime para notificações de mudança de status
    const channel = supabase
      .channel(`client-appointments-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `client_auth_id=eq.${clientId}`
        },
        (payload) => {
          const updatedAppointment = payload.new as any;
          
          if (updatedAppointment.status === 'confirmed') {
            toast({
              title: "✅ Agendamento Confirmado!",
              description: "Seu agendamento foi aprovado pelo estabelecimento",
              duration: 8000,
            });
          } else if (updatedAppointment.status === 'cancelled') {
            toast({
              title: "❌ Agendamento Cancelado",
              description: "Seu agendamento foi cancelado pelo estabelecimento",
              variant: "destructive",
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, appointments, toast]);

  if (pendingAppointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
        Agendamentos Pendentes
      </h3>
      
      <div className="grid gap-4">
        {pendingAppointments.map((appointment) => (
          <Card key={appointment.id} className="border-l-4 border-l-orange-500 bg-orange-50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-900">
                  {appointment.salon?.name}
                </CardTitle>
                <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-100">
                  Aguardando aprovação
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <p className="font-medium">{appointment.service?.name}</p>
                <p className="text-sm text-gray-600">
                  {appointment.service?.duration_minutes} min - R$ {appointment.service?.price}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-blue-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {format(new Date(appointment.appointment_date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center text-blue-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{appointment.appointment_time}</span>
                </div>
              </div>

              {appointment.notes && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Observações:</strong> {appointment.notes}
                  </p>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Aguardando aprovação do estabelecimento
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Você receberá uma notificação assim que o agendamento for confirmado ou recusado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingAppointments;
