
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, Mail, MessageSquare, Calendar, Clock, DollarSign, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';
import { useBookingClientData } from '@/hooks/booking/useBookingClientData';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface SimpleClientDataStepProps {
  selectedService: Service | null;
  selectedAdditionalServices?: Service[];
  selectedDate: Date | undefined;
  selectedTime: string;
  clientData: ClientData;
  isSubmitting: boolean;
  onClientDataChange: (data: ClientData) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
  formatCurrency: (value: number) => string;
}

const SimpleClientDataStep = ({
  selectedService,
  selectedAdditionalServices = [],
  selectedDate,
  selectedTime,
  clientData,
  isSubmitting,
  onClientDataChange,
  onSubmit,
  onBack,
  onCancel,
  formatCurrency
}: SimpleClientDataStepProps) => {
  // Auto-fill client data from database
  const { hasAutoFilled, isLoading } = useBookingClientData(clientData, onClientDataChange);

  const totalPrice = (selectedService?.price || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.price, 0);
  
  const totalDuration = (selectedService?.duration_minutes || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.duration_minutes, 0);

  const handleNotesChange = (value: string) => {
    onClientDataChange({
      ...clientData,
      notes: value
    });
  };

  const isFormValid = clientData.name.trim() && clientData.phone.trim();

  // Debug log
  useEffect(() => {
    console.log('SimpleClientDataStep - Current client data:', {
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      hasAutoFilled,
      isLoading
    });
  }, [clientData, hasAutoFilled, isLoading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Badge variant="outline" className="text-sm">
          Passo 4 de 4
        </Badge>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-center mb-2">Resumo do Agendamento</h3>
        <p className="text-gray-600 text-center mb-6">
          Confira os detalhes do seu agendamento antes de finalizar
        </p>
      </div>

      {/* Resumo dos Serviços */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Serviços Selecionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">{selectedService?.name}</span>
              <span className="text-green-600 font-semibold">{formatCurrency(selectedService?.price || 0)}</span>
            </div>
            
            {selectedAdditionalServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm">
                <span className="text-blue-800">+ {service.name}</span>
                <span className="text-green-600 font-semibold">{formatCurrency(service.price)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Data e Horário */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Data e Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-purple-900">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Data:</span>
              </div>
              <span className="font-medium text-purple-900">
                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ''}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-purple-900">
                <Clock className="h-4 w-4 mr-2" />
                <span>Horário:</span>
              </div>
              <span className="font-medium text-purple-900">{selectedTime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-purple-700">
                <Clock className="h-4 w-4 mr-2" />
                <span>Duração Total:</span>
              </div>
              <span className="text-purple-700">{totalDuration} minutos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total do Agendamento */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center font-bold text-xl">
            <div className="flex items-center text-green-900">
              <DollarSign className="h-6 w-6 mr-2" />
              <span>Valor Total:</span>
            </div>
            <span className="text-green-600">{formatCurrency(totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-amber-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-amber-600" />
            Seus Dados {isLoading && <span className="text-sm ml-2">(Carregando...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Nome:</p>
                <p className="font-medium text-gray-900">
                  {clientData.name || 'Carregando...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Telefone:</p>
                <p className="font-medium text-gray-900">
                  {clientData.phone || 'Carregando...'}
                </p>
              </div>
            </div>
            
            {clientData.email && (
              <div className="flex items-center space-x-3 md:col-span-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-medium text-gray-900">{clientData.email}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-amber-100 p-3 rounded-lg border border-amber-300">
            <p className="text-sm text-amber-800">
              <strong>✓ Dados confirmados:</strong> As informações acima foram carregadas automaticamente do seu perfil.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Observações (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="clientNotes" className="text-sm font-medium">
              Alguma observação adicional sobre o agendamento?
            </Label>
            <Textarea
              id="clientNotes"
              placeholder="Ex: Preferência de horário, necessidades especiais, etc..."
              value={clientData.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="mt-1 min-h-[80px]"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aviso Importante */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>📋 Importante:</strong> Ao confirmar, sua solicitação de agendamento será enviada para o estabelecimento.
          </p>
          <p className="text-xs text-blue-600">
            Você receberá uma confirmação assim que o estabelecimento aprovar seu agendamento.
          </p>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting || isLoading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isSubmitting ? 'Enviando Solicitação...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
};

export default SimpleClientDataStep;
