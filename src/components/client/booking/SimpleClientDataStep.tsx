
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Phone, Mail, MessageSquare, Calendar, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';

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
  const totalPrice = (selectedService?.price || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.price, 0);
  
  const totalDuration = (selectedService?.duration_minutes || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.duration_minutes, 0);

  const handleInputChange = (field: keyof ClientData, value: string) => {
    onClientDataChange({
      ...clientData,
      [field]: value
    });
  };

  const isFormValid = clientData.name.trim() && clientData.phone.trim();

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
        <h3 className="text-2xl font-bold text-center mb-2">Seus Dados</h3>
        <p className="text-gray-600 text-center mb-6">
          Preencha suas informações para finalizar o agendamento
        </p>
      </div>

      {/* Resumo Final do Agendamento */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900">Resumo do Agendamento</CardTitle>
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
            
            <hr className="border-blue-200" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-blue-900">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Data:</span>
              </div>
              <span className="font-medium text-blue-900">
                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ''}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-blue-900">
                <Clock className="h-4 w-4 mr-2" />
                <span>Horário:</span>
              </div>
              <span className="font-medium text-blue-900">{selectedTime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                <span>Duração Total:</span>
              </div>
              <span className="text-blue-700">{totalDuration} minutos</span>
            </div>
            
            <hr className="border-blue-200" />
            
            <div className="flex justify-between items-center font-bold text-lg">
              <div className="flex items-center text-blue-900">
                <DollarSign className="h-5 w-5 mr-2" />
                <span>Total:</span>
              </div>
              <span className="text-green-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName" className="text-sm font-medium">
                Nome Completo *
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={clientData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientPhone" className="text-sm font-medium">
                Telefone *
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={clientData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="clientEmail" className="text-sm font-medium">
              E-mail (opcional)
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientEmail"
                type="email"
                placeholder="seu@email.com"
                value={clientData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientNotes" className="text-sm font-medium">
              Observações (opcional)
            </Label>
            <div className="relative mt-1">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="clientNotes"
                placeholder="Alguma observação adicional sobre o agendamento..."
                value={clientData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="pl-10 min-h-[80px]"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
};

export default SimpleClientDataStep;
