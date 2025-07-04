
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, Scissors, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from '@/hooks/useAuth';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useClientData } from '@/hooks/useClientData';

const ClientAppointments = () => {
  const { user } = useAuth();
  const { appointments, loading, fetchClientAppointments } = useAppointmentData();
  const { getClientByPhone } = useClientData();
  const [clientId, setClientId] = useState<string | null>(null);

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
                  {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
              
              <div className="text-xs text-gray-500 pt-2 border-t">
                Criado em {format(new Date(appointment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientAppointments;
