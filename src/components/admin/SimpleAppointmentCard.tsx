import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, CheckCircle2, XCircle, Calendar } from "lucide-react";
interface SimpleAppointmentCardProps {
  appointment: {
    id: string;
    status: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
    client?: {
      name: string;
      username: string;
      phone?: string;
    };
    service?: {
      name: string;
      price: number;
      duration_minutes: number;
    };
  };
  onUpdateStatus: (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => Promise<boolean>;
  isUpdating?: boolean;
  compact?: boolean;
}
const SimpleAppointmentCard = ({
  appointment,
  onUpdateStatus,
  isUpdating = false,
  compact = false
}: SimpleAppointmentCardProps) => {
  const handleStatusUpdate = async (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    console.log('🎯 SimpleAppointmentCard: INICIANDO ATUALIZAÇÃO DE STATUS:', {
      appointmentId: appointment.id,
      currentStatus: appointment.status,
      newStatus,
      isUpdating,
      timestamp: new Date().toISOString()
    });
    if (isUpdating) {
      console.warn('⚠️ SimpleAppointmentCard: Already updating, ignoring click');
      return;
    }
    try {
      console.log('🚀 SimpleAppointmentCard: Chamando onUpdateStatus...');
      const success = await onUpdateStatus(appointment.id, newStatus);
      console.log('✅ SimpleAppointmentCard: RESULTADO DA ATUALIZAÇÃO:', {
        success,
        appointmentId: appointment.id,
        newStatus,
        timestamp: new Date().toISOString()
      });
      if (!success) {
        console.error('❌ SimpleAppointmentCard: FALHA NA ATUALIZAÇÃO - success = false');
      } else {
        console.log('🎉 SimpleAppointmentCard: ATUALIZAÇÃO BEM-SUCEDIDA!');
      }
    } catch (error) {
      console.error('❌ SimpleAppointmentCard: ERRO DURANTE ATUALIZAÇÃO:', error);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'completed':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };
  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800'
      },
      'confirmed': {
        label: 'Confirmado',
        color: 'bg-green-100 text-green-800'
      },
      'completed': {
        label: 'Concluído',
        color: 'bg-blue-100 text-blue-800'
      },
      'cancelled': {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800'
      }
    };
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return <Badge className={`${variant.color} text-xs px-2 py-1 font-medium`}>
        {variant.label}
      </Badge>;
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Parse "Serviços Adicionais" da nota do agendamento
  const parseAdditionalServices = (notes?: string): Array<{
    name: string;
    duration: number;
    price: number;
  }> => {
    if (!notes) return [];
    const additionalServicesMatch = notes.match(/Serviços Adicionais:\s*(.+?)(?:\n\n|$)/s);
    if (!additionalServicesMatch) return [];
    const servicesText = additionalServicesMatch[1];
    const serviceMatches = servicesText.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/g);
    if (!serviceMatches) return [];
    return serviceMatches.map(match => {
      const parts = match.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/);
      if (!parts) return null as any;
      return {
        name: parts[1].trim(),
        duration: parseInt(parts[2]),
        price: parseFloat(parts[3].replace(',', ''))
      };
    }).filter(Boolean) as Array<{
      name: string;
      duration: number;
      price: number;
    }>;
  };
  const additionalServices = parseAdditionalServices(appointment.notes);
  const additionalTotal = additionalServices.reduce((sum, s) => sum + s.price, 0);
  if (compact) {
    return <Card className={`border shadow-sm mb-2 hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}>
        <CardContent className="p-3 rounded-none">
          {/* Cabeçalho compacto */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary rounded-sm" />
              <span className="font-bold text-xs">{appointment.appointment_time}</span>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Informações do cliente e serviço */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold truncate text-xs">
                {appointment.client?.name || appointment.client?.username || 'Cliente'}
              </span>
            </div>
            <span className="font-bold text-primary text-sm ml-2">
              {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>

          {/* Nome do serviço */}
          <div className="text-sm text-muted-foreground truncate mb-2 rounded-sm">
            {appointment.service?.name}
          </div>
          
          {/* Resumo de adicionais */}
          {additionalServices.length > 0 && <div className="flex items-center justify-between mt-2 mb-2">
              <span className="text-sm text-muted-foreground">+ {additionalServices.length} serviço(s)</span>
              <span className="text-accent font-semibold text-sm">+ {formatCurrency(additionalTotal)}</span>
            </div>}

          {/* Botões de ação compactos */}
          {!isUpdating && <>
              {appointment.status === 'pending' && <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => {
              console.log('🟢 CONFIRMAR CLICADO!', {
                appointmentId: appointment.id,
                status: appointment.status
              });
              handleStatusUpdate('confirmed');
            }} disabled={isUpdating} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 h-8 text-xs px-2 font-medium">
                    ✓ Confirmar
                  </Button>
                  <Button size="sm" onClick={() => {
              console.log('🔵 CONCLUIR DIRETO CLICADO!', {
                appointmentId: appointment.id,
                status: appointment.status
              });
              handleStatusUpdate('completed');
            }} disabled={isUpdating} className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1 h-8 text-xs px-2 font-medium">
                    ✓✓ Concluir
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => {
              console.log('🔴 CANCELAR CLICADO!', {
                appointmentId: appointment.id,
                status: appointment.status
              });
              handleStatusUpdate('cancelled');
            }} disabled={isUpdating} className="flex-1 h-8 text-xs px-2 font-medium">
                    ✗ Cancelar
                  </Button>
                </div>}

              {appointment.status === 'confirmed' && <Button size="sm" onClick={() => {
            console.log('🔥 BOTÃO CONCLUIR CONFIRMADO CLICADO!', {
              appointmentId: appointment.id,
              status: appointment.status,
              isUpdating,
              timestamp: new Date().toISOString()
            });
            handleStatusUpdate('completed');
          }} disabled={isUpdating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-8 font-bold disabled:bg-muted disabled:cursor-not-allowed mt-3 text-xs">
                  {isUpdating ? 'PROCESSANDO...' : 'CONCLUIR ATENDIMENTO'}
                </Button>}

              {appointment.status === 'completed' && <div className="text-center py-2 mt-3 rounded-sm">
                  <span className="text-primary font-bold text-xs">✅ CONCLUÍDO</span>
                </div>}

              {appointment.status === 'cancelled' && <div className="text-center py-2 mt-3">
                  <span className="text-destructive font-bold text-sm">❌ CANCELADO</span>
                </div>}
            </>}

          {isUpdating && <div className="flex items-center justify-center py-3 mt-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-primary font-medium">Atualizando...</span>
            </div>}
        </CardContent>
      </Card>;
  }
  return <Card className={`border shadow-sm mb-3 hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-bold text-lg">{appointment.appointment_time}</p>
              <p className="text-sm text-gray-600">{formatDate(appointment.appointment_date)}</p>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        {/* Client info */}
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium">{appointment.client?.name || appointment.client?.username || 'Cliente'}</p>
            {appointment.client?.phone && <p className="text-sm text-gray-600">{appointment.client.phone}</p>}
          </div>
        </div>

        {/* Service info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{appointment.service?.name}</p>
              <p className="text-sm text-gray-600">
                Duração: {appointment.service?.duration_minutes || 0} min
              </p>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(appointment.service?.price || 0)}
            </p>
          </div>
        </div>

        {/* Additional services */}
        {additionalServices.length > 0 && <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
            <p className="font-medium text-blue-900 mb-2">Serviços Adicionais</p>
            <div className="space-y-1">
              {additionalServices.map((s, i) => <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{s.name} ({s.duration} min)</span>
                  <span className="text-green-700 font-semibold">{formatCurrency(s.price)}</span>
                </div>)}
            </div>
            <div className="flex items-center justify-between mt-2 text-sm font-semibold">
              <span>Total adicionais</span>
              <span>{formatCurrency(additionalTotal)}</span>
            </div>
          </div>}


        {/* Action buttons */}
        {!isUpdating && <div className="space-y-2">
            {appointment.status === 'pending' && <div className="flex gap-2 flex-col sm:flex-row">
                <div className="flex gap-2 w-full">
                  <Button onClick={() => handleStatusUpdate('confirmed')} className="bg-green-600 hover:bg-green-700 text-white flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar
                  </Button>
                  <Button onClick={() => handleStatusUpdate('completed')} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                </div>
                <Button variant="destructive" onClick={() => handleStatusUpdate('cancelled')} className="w-full sm:w-auto">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>}

            {appointment.status === 'confirmed' && <Button onClick={() => {
          console.log('🔥 BOTÃO CONCLUIR GRANDE CLICADO!', {
            appointmentId: appointment.id,
            status: appointment.status,
            isUpdating,
            timestamp: new Date().toISOString()
          });
          handleStatusUpdate('completed');
        }} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 disabled:bg-gray-400 disabled:cursor-not-allowed">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {isUpdating ? 'FINALIZANDO ATENDIMENTO...' : 'FINALIZAR ATENDIMENTO'}
              </Button>}

            {appointment.status === 'completed' && <div className="text-center py-2">
                <span className="text-blue-600 font-bold">✅ ATENDIMENTO CONCLUÍDO</span>
              </div>}

            {appointment.status === 'cancelled' && <div className="text-center py-2">
                <span className="text-red-600 font-bold">❌ AGENDAMENTO CANCELADO</span>
              </div>}
          </div>}

        {isUpdating && <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-600 font-medium">Atualizando status...</span>
          </div>}
      </CardContent>
    </Card>;
};
export default SimpleAppointmentCard;