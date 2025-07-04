
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { format } from "date-fns";
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
  const { user, hasAutoFilled, isLoading } = useBookingClientData(
    clientData,
    onClientDataChange
  );

  // Verificar se é cliente logado
  const isClientLoggedIn = () => {
    const clientAuth = localStorage.getItem('clientAuth');
    return !!clientAuth;
  };

  // Validar se pode submeter
  const canSubmit = () => {
    return selectedService && 
           selectedDate && 
           selectedTime && 
           clientData.name?.trim() && 
           clientData.phone?.trim() && 
           !isSubmitting &&
           hasAutoFilled;
  };

  if (!isClientLoggedIn()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Badge variant="outline">Passo 3 de 3</Badge>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold mb-2 text-red-800">Login Necessário</h4>
            <p className="text-red-600 mb-4">
              Você precisa fazer login como cliente para finalizar o agendamento.
            </p>
            <Button onClick={() => window.location.href = '/client-login'} variant="outline">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <Badge variant="outline">Passo 3 de 3</Badge>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold">Confirme seus dados para finalizar</h3>
        <p className="text-gray-600">Revise as informações do seu agendamento</p>
      </div>

      {/* Resumo do Agendamento */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Resumo do Agendamento</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Serviço:</strong> {selectedService?.name} - {formatCurrency(selectedService?.price || 0)}</p>
            <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd/MM/yyyy")}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
            <p><strong>Duração:</strong> {selectedService?.duration_minutes} minutos</p>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente - Carregados automaticamente */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Seus Dados (Carregados Automaticamente)
          </h4>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando seus dados...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                  <p className="font-medium text-gray-900">
                    {clientData.name || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Telefone</p>
                  <p className="font-medium text-gray-900">
                    {clientData.phone || 'Não informado'}
                  </p>
                </div>
              </div>

              {clientData.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">E-mail</p>
                    <p className="font-medium text-gray-900">{clientData.email}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {hasAutoFilled && (
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <p className="text-xs text-green-800">
                ✓ Dados carregados automaticamente do seu perfil
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campo de Observações */}
      <div>
        <Label htmlFor="notes">Observações (Opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Alguma observação adicional sobre o agendamento?"
          value={clientData.notes}
          onChange={(e) => onClientDataChange({ ...clientData, notes: e.target.value })}
          disabled={isSubmitting}
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Alerta se dados não foram carregados */}
      {!hasAutoFilled && !isLoading && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-amber-800 text-sm">
              ⚠️ Não foi possível carregar seus dados automaticamente. Verifique se você está logado corretamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={onSubmit}
          disabled={!canSubmit()}
          className="flex items-center min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Finalizar Agendamento'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SimpleClientDataStep;
