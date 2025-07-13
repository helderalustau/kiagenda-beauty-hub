
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin, Scissors, User, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from '@/hooks/useAuth';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useClientData } from '@/hooks/useClientData';
import { useToast } from "@/hooks/use-toast";

const ClientAppointments = () => {
  const { user } = useAuth();
  const { appointments, loading, fetchClientAppointments, updateAppointmentStatus } = useAppointmentData();
  const { getClientByPhone } = useClientData();
  const [clientId, setClientId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadClientAndAppointments = async () => {
      if (!user?.id) return;

      try {
        // Buscar ID do cliente usando o phone (que é o ID do usuário)
        const result = await getClientByPhone(user.id);
        if (result.success && result.client) {
          setClientId(result.client.id);
          await fetchClientAppointments(result.client.id);
        }
      } catch (error) {
        console.error('Error loading client appointments:', error);
      }
    };

    loadClientAndAppointments();
  }, [user?.id, getClientByPhone, fetchClientAppointments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação direta da data sem conversões que alterem o dia
  const formatAppointmentDate = (dateString: string) => {
    // Para appointment_date (formato YYYY-MM-DD), usar split direto
    if (dateString && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      
      const monthName = months[monthNum - 1];
      return `${dayNum.toString().padStart(2, '0')} de ${monthName} de ${yearNum}`;
    }
    
    return dateString;
  };

  const formatCreatedAt = (dateString: string) => {
    try {
      // Para created_at, usar parseISO pois inclui horário
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting created_at:', dateString, error);
      return dateString;
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const result = await updateAppointmentStatus(appointmentId, 'cancelled');
      
      if (result.success) {
        toast({
          title: "Agendamento Cancelado",
          description: "Sua solicitação foi cancelada com sucesso.",
        });
        
        // Recarregar os agendamentos
        if (clientId) {
          await fetchClientAppointments(clientId);
        }
      } else {
        toast({
          title: "Erro ao cancelar",
          description: result.message || "Erro ao cancelar agendamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao cancelar agendamento",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-500">Você ainda não possui agendamentos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Meus Agendamentos</h2>
      
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                {appointment.salon?.name || 'Estabelecimento'}
              </CardTitle>
              {getStatusBadge(appointment.status)}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Scissors className="h-4 w-4 mr-2" />
                <span className="font-medium">{appointment.service?.name}</span>
                <span className="ml-2 text-sm">
                  - {formatCurrency(appointment.service?.price || 0)}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>
                  {formatAppointmentDate(appointment.appointment_date)}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{appointment.appointment_time}</span>
                {appointment.service?.duration_minutes && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({appointment.service.duration_minutes} min)
                  </span>
                )}
              </div>

              {appointment.salon?.address && (
                <div className="flex items-start text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{appointment.salon.address}</span>
                </div>
              )}

              {appointment.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Observações:</strong> {appointment.notes}
                  </p>
                </div>
              )}

              {/* Botão de cancelamento para agendamentos pendentes */}
              {appointment.status === 'pending' && (
                <div className="flex justify-end pt-3 border-t">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar Solicitação</span>
                  </Button>
                </div>
              )}
              
              <div className="text-xs text-gray-500 pt-2 border-t">
                Criado em {formatCreatedAt(appointment.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientAppointments;
