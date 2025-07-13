
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Scissors, CheckCircle, AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Salon } from '@/hooks/useSupabaseData';
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/hooks/use-toast";

interface ClientDashboardContentProps {
  salons: Salon[];
  onBookService: (salon: Salon) => void;
  activeAppointments: Appointment[];
  completedAppointments: Appointment[];
  onAppointmentUpdate?: () => void;
}

const ClientDashboardContent = ({ 
  salons, 
  onBookService, 
  activeAppointments, 
  completedAppointments,
  onAppointmentUpdate 
}: ClientDashboardContentProps) => {
  const { updateAppointmentStatus } = useAppointmentData();
  const { toast } = useToast();
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

  // Formatação direta da data sem conversões de timezone
  const formatAppointmentDate = (dateString: string) => {
    // Para appointment_date (formato YYYY-MM-DD), usar split direto
    if (dateString && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      
      const monthName = months[monthNum - 1];
      return `${dayNum} de ${monthName}`;
    }
    
    return dateString;
  };

  const formatCompletedDate = (dateString: string) => {
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
      return `${dayNum} de ${monthName} de ${yearNum}`;
    }
    
    return dateString;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const result = await updateAppointmentStatus(appointmentId, 'cancelled');
      
      if (result.success) {
        toast({
          title: "Agendamento Cancelado",
          description: "Sua solicitação foi cancelada com sucesso.",
        });
        
        // Notificar o componente pai para atualizar a lista
        if (onAppointmentUpdate) {
          onAppointmentUpdate();
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Seção de Agendamentos Ativos */}
      {activeAppointments.length > 0 && (
        <section>
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Agendamentos Ativos</h2>
          </div>
          
          <div className="grid gap-4">
            {activeAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                      {(appointment as any).salon?.name}
                    </CardTitle>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Scissors className="h-4 w-4 mr-2" />
                    <span className="font-medium">{(appointment as any).service?.name}</span>
                    <span className="ml-2 text-sm">
                      - {formatCurrency((appointment as any).service?.price || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-blue-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {formatAppointmentDate(appointment.appointment_date)}
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

                  {/* Botão de cancelamento para agendamentos pendentes */}
                  {appointment.status === 'pending' && (
                    <div className="flex justify-end">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Seção de Estabelecimentos Disponíveis com Mini Banner */}
      <section>
        <div className="flex items-center mb-4">
          <Scissors className="h-5 w-5 mr-2 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Estabelecimentos Disponíveis</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-lg transition-all duration-300 group">
              {/* Mini Banner */}
              {salon.banner_image_url && (
                <div className="relative h-32 overflow-hidden rounded-t-lg">
                  <img 
                    src={salon.banner_image_url} 
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{salon.name}</CardTitle>
                <p className="text-sm text-gray-600">{salon.owner_name}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{salon.address}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant={salon.is_open ? "default" : "secondary"} className={
                    salon.is_open 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }>
                    {salon.is_open ? 'Aberto' : 'Fechado'}
                  </Badge>
                  
                  <Button 
                    size="sm" 
                    onClick={() => onBookService(salon)}
                    disabled={!salon.is_open}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Agendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção de Histórico de Atendimentos - Movido para baixo */}
      <section>
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Atendimentos</h2>
        </div>
        
        {completedAppointments.length > 0 ? (
          <div className="grid gap-4">
            {completedAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-green-500 bg-green-50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                      {(appointment as any).salon?.name}
                    </CardTitle>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Scissors className="h-4 w-4 mr-2" />
                    <span className="font-medium">{(appointment as any).service?.name}</span>
                    <span className="ml-2 text-sm">
                      - {formatCurrency((appointment as any).service?.price || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {formatCompletedDate(appointment.appointment_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-white p-2 rounded border">
                      <p className="text-sm text-gray-700">
                        <strong>Observações:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento realizado</h3>
              <p className="text-gray-500 mb-4">Você ainda não possui histórico de atendimentos.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default ClientDashboardContent;
