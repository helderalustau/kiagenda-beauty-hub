import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, Mail, MapPin, MessageSquare, DollarSign, CheckCircle, XCircle, Scissors, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}
const AppointmentDetailsModal = ({
  appointment,
  isOpen,
  onClose,
  onStatusUpdate
}: AppointmentDetailsModalProps) => {
  const {
    toast
  } = useToast();
  const [updating, setUpdating] = useState(false);
  if (!appointment) return null;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };
  const parseAdditionalServices = (notes: string): Array<{
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
  const additionalServices = parseAdditionalServices(appointment.notes || '');
  const clientNotes = getClientNotes(appointment.notes || '');
  const mainServicePrice = (appointment.service as any)?.price || 0;
  const additionalServicesPrice = additionalServices.reduce((sum, service) => sum + service.price, 0);
  const totalPrice = mainServicePrice + additionalServicesPrice;
  const totalDuration = ((appointment.service as any)?.duration_minutes || 0) + additionalServices.reduce((sum, service) => sum + service.duration, 0);
const updateAppointmentStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      console.log('🔄 AppointmentDetailsModal: Updating status to:', newStatus);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ AppointmentDetailsModal: Status updated successfully');
      
      // Se foi concluído, processar dados financeiros
      if (newStatus === 'completed') {
        console.log('💰 Processing financial data for completed appointment...');
        
        const { data: financialData, error: financialError } = await supabase.functions.invoke('process-appointment-completion', {
          body: { appointmentId: appointment.id }
        });
        
        if (financialError) {
          console.error('❌ Financial processing error:', financialError);
          toast({
            title: "Aviso financeiro",
            description: "Status atualizado, mas houve erro no processamento financeiro",
            variant: "destructive"
          });
        } else {
          console.log('✅ Financial processing successful:', financialData);
        }
      }
      
      toast({
        title: "Status atualizado",
        description: `Agendamento ${getStatusText(newStatus).toLowerCase()} com sucesso.`
      });
      
      // Atualizar dados do appointment no estado local
      if (data) {
        Object.assign(appointment, data);
      }
      
      onStatusUpdate?.();
      onClose();
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do agendamento.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes do Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status e Data */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-semibold text-sm">Status do Agendamento</CardTitle>
                  <Badge className={`${getStatusColor(appointment.status)} text-sm px-3 py-1 border mt-2`}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-gray-600 text-sm mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(appointment.appointment_date), "dd/MM/yyyy", {
                    locale: ptBR
                  })}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {appointment.appointment_time}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Serviços */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900 flex items-center">
                <Scissors className="h-5 w-5 mr-2" />
                Serviços Contratados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mx-[12px] my-0 py-0 px-[8px]">
              {/* Serviço Principal */}
              <div className="bg-white p-4 border border-blue-200 rounded-sm mx-0 py-0 px-[23px] my-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-blue-900 text-sm my-[14px]">
                    {(appointment.service as any)?.name || 'Serviço'}
                  </h4>
                  <div className="text-right">
                    <div className="text-green-600 font-bold text-lg rounded-sm">
                      {formatCurrency(mainServicePrice)}
                    </div>
                    <div className="text-blue-600 text-sm">
                      {(appointment.service as any)?.duration_minutes || 0} min
                    </div>
                  </div>
                </div>
                {(appointment.service as any)?.description && <p className="text-gray-600 text-sm">
                    {(appointment.service as any).description}
                  </p>}
              </div>

              {/* Serviços Adicionais */}
              {additionalServices.length > 0 && <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Plus className="h-4 w-4 mr-1" />
                      Serviços Adicionais
                    </h4>
                    <div className="space-y-2">
                      {additionalServices.map((service, index) => <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-blue-800">{service.name}</span>
                            <div className="text-right">
                              <div className="text-green-600 font-semibold">
                                {formatCurrency(service.price)}
                              </div>
                              <div className="text-blue-600 text-sm">
                                {service.duration} min
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>
                </>}

              <Separator />

              {/* Total */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-200 rounded-sm px-[22px] py-[2px]">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-green-900 text-sm">Total do Agendamento</h4>
                    <p className="text-green-700 text-sm">
                      Duração total: {totalDuration} minutos
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold text-2xl rounded-sm">
                      {formatCurrency(totalPrice)}
                    </div>
                    <div className="text-green-700 text-sm">
                      {additionalServices.length > 0 ? `${1 + additionalServices.length} serviço${additionalServices.length > 0 ? 's' : ''}` : '1 serviço'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Cliente */}
          <Card>
            <CardHeader className="my-0 px-[4px] py-[2px]">
              <CardTitle className="flex items-center text-sm">
                <User className="h-5 w-5 mr-2" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 rounded-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 rounded-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">
                      {(appointment as any).client?.name || (appointment as any).client_auth?.name || 'Cliente não identificado'}
                    </p>
                  </div>
                </div>

                {((appointment as any).client?.phone || (appointment as any).client_auth?.phone) && <div className="flex items-center space-x-3 rounded-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">
                        {(appointment as any).client?.phone || (appointment as any).client_auth?.phone}
                      </p>
                    </div>
                  </div>}

                {((appointment as any).client?.email || (appointment as any).client_auth?.email) && <div className="flex items-center space-x-3 rounded-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">E-mail</p>
                      <p className="font-medium">
                        {(appointment as any).client?.email || (appointment as any).client_auth?.email}
                      </p>
                    </div>
                  </div>}
              </div>
            </CardContent>
          </Card>

          {/* Observações do Cliente */}
          {clientNotes && <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Observações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{clientNotes}</p>
              </CardContent>
            </Card>}

          {/* Ações */}
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && <Card>
              <CardHeader>
                <CardTitle>Ações do Agendamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {appointment.status === 'pending' && <Button onClick={() => updateAppointmentStatus('confirmed')} disabled={updating} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>}
                  
                  {appointment.status === 'confirmed' && <Button onClick={() => updateAppointmentStatus('completed')} disabled={updating} className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>}

                  <Button onClick={() => updateAppointmentStatus('cancelled')} disabled={updating} variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>}
        </div>
      </DialogContent>
    </Dialog>;
};
export default AppointmentDetailsModal;