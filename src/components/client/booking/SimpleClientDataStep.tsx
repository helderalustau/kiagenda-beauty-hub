
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, Mail, ArrowLeft, CheckCircle, MapPin } from "lucide-react";
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

  // Verificar se é cliente logado através do localStorage
  const isClientLoggedIn = () => {
    const clientAuth = localStorage.getItem('clientAuth');
    if (!clientAuth) return false;
    
    try {
      const parsedAuth = JSON.parse(clientAuth);
      return !!(parsedAuth && parsedAuth.id && parsedAuth.username);
    } catch {
      return false;
    }
  };

  // Obter dados do cliente logado
  const getLoggedClientData = () => {
    const clientAuth = localStorage.getItem('clientAuth');
    if (!clientAuth) return null;
    
    try {
      return JSON.parse(clientAuth);
    } catch {
      return null;
    }
  };

  // Auto-preencher dados do cliente logado se ainda não foram preenchidos
  useEffect(() => {
    if (isClientLoggedIn() && (!clientData.name || !clientData.phone)) {
      const loggedClient = getLoggedClientData();
      if (loggedClient) {
        console.log('Auto-filling client data from logged client:', loggedClient);
        onClientDataChange({
          name: loggedClient.name || loggedClient.username || '',
          phone: loggedClient.phone || '',
          email: loggedClient.email || '',
          notes: clientData.notes || ''
        });
      }
    }
  }, [clientData, onClientDataChange]);

  // Validar se pode submeter - versão melhorada
  const canSubmit = () => {
    const loggedClient = getLoggedClientData();
    
    // Verificar dados básicos necessários
    const hasService = selectedService !== null;
    const hasDate = selectedDate !== undefined;
    const hasTime = selectedTime !== '';
    const hasClientName = (clientData.name?.trim() || loggedClient?.name || loggedClient?.username || '').trim() !== '';
    const hasClientPhone = (clientData.phone?.trim() || loggedClient?.phone || '').trim() !== '';
    const notSubmitting = !isSubmitting;
    
    console.log('canSubmit validation:', {
      hasService,
      hasDate,
      hasTime,
      hasClientName,
      hasClientPhone,
      notSubmitting,
      clientData,
      loggedClient
    });
    
    return hasService && hasDate && hasTime && hasClientName && hasClientPhone && notSubmitting;
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

  const loggedClient = getLoggedClientData();

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

      {/* Dados do Cliente - Exibir dados do cliente logado */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Seus Dados
          </h4>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Nome</p>
                <p className="font-medium text-gray-900">
                  {clientData.name || loggedClient?.name || loggedClient?.username || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Telefone</p>
                <p className="font-medium text-gray-900">
                  {clientData.phone || loggedClient?.phone || 'Não informado'}
                </p>
              </div>
            </div>

            {(clientData.email || loggedClient?.email) && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">E-mail</p>
                  <p className="font-medium text-gray-900">{clientData.email || loggedClient?.email}</p>
                </div>
              </div>
            )}

            {(loggedClient?.city || loggedClient?.state) && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Localização</p>
                  <p className="font-medium text-gray-900">
                    {loggedClient.city}{loggedClient.city && loggedClient.state && ', '}{loggedClient.state}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 p-2 bg-green-100 rounded-lg">
            <p className="text-xs text-green-800">
              ✓ Dados obtidos do seu perfil logado
            </p>
          </div>
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

      {/* Debug Info - Remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 p-2 bg-gray-100 rounded">
          Debug: canSubmit={canSubmit().toString()} | 
          clientData.name="{clientData.name}" | 
          clientData.phone="{clientData.phone}" |
          loggedClient.name="{loggedClient?.name}" |
          loggedClient.phone="{loggedClient?.phone}"
        </div>
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
