import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, CheckCircle2, XCircle, Scissors, Eye } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentParser } from '@/hooks/useAppointmentParser';
import AppointmentDetailsModal from '../AppointmentDetailsModal';

interface EnhancedAppointmentCardProps {
  appointment: Appointment;
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const EnhancedAppointmentCard = ({ appointment, onUpdateAppointment, isUpdating }: EnhancedAppointmentCardProps) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { parseAppointment, formatCurrency } = useAppointmentParser();
  
  const parsedAppointment = parseAppointment(appointment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <>
      <Card className="mb-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xl font-bold text-foreground flex items-center">
                  <User className="h-6 w-6 mr-3 text-primary" />
                  {appointment.client?.name || appointment.client?.username || 'Cliente'}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(true)}
                    className="hover:bg-muted"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3 text-lg text-muted-foreground">
                <div className="flex items-center bg-muted/50 p-3 rounded-lg">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span className="font-bold text-lg">{appointment.appointment_time}</span>
                </div>
                
                {appointment.client?.phone && (
                  <div className="flex items-center bg-muted/30 p-3 rounded-lg">
                    <Phone className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-bold text-lg">{appointment.client.phone}</span>
                  </div>
                )}

                {/* Lista de Serviços em formato de pedido */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Scissors className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-semibold text-blue-900">Serviços Contratados</span>
                  </div>
                  
                  <div className="space-y-2">
                    {parsedAppointment.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                            service.type === 'main' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <span className="font-medium text-gray-900">{service.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({service.duration}min)</span>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total Consolidado */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-200">
                      <div>
                        <span className="font-bold text-green-900 text-lg">Total do Pedido</span>
                        <div className="text-sm text-green-700">
                          {parsedAppointment.services.length} serviço{parsedAppointment.services.length > 1 ? 's' : ''} • {parsedAppointment.totalDuration}min
                        </div>
                      </div>
                      <span className="font-bold text-green-600 text-2xl">
                        {formatCurrency(parsedAppointment.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {appointment.status === 'pending' && (
            <div className="flex gap-3 mt-4">
              <Button
                size="lg"
                onClick={() => onUpdateAppointment(appointment.id, { status: 'confirmed' })}
                disabled={isUpdating}
                className="bg-success hover:bg-success/90 text-white flex-1 font-semibold py-3"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => onUpdateAppointment(appointment.id, { status: 'cancelled' })}
                disabled={isUpdating}
                className="flex-1 font-semibold py-3"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          )}

          {appointment.status === 'confirmed' && (
            <Button
              size="lg"
              onClick={() => onUpdateAppointment(appointment.id, { status: 'completed' })}
              disabled={isUpdating}
              className="w-full mt-4 bg-primary hover:bg-primary/90 font-semibold py-3 text-lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar Atendimento - {formatCurrency(parsedAppointment.totalPrice)}
            </Button>
          )}
        </CardContent>
      </Card>

      <AppointmentDetailsModal
        appointment={appointment}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onStatusUpdate={() => {
          // Refresh data if needed
        }}
      />
    </>
  );
};

export default EnhancedAppointmentCard;