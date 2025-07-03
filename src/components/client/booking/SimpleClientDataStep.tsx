
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Service } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter';

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
  const { user, isClient } = useAuth();
  const { formatPhoneNumber } = usePhoneFormatter();

  // Auto-preencher dados do cliente logado
  useEffect(() => {
    const loadClientData = async () => {
      console.log('SimpleClientDataStep - Loading client data for user:', { 
        userId: user?.id, 
        isClient,
        hasData: !!(clientData.name && clientData.phone)
      });

      if (!user?.id || !isClient) {
        console.log('SimpleClientDataStep - User is not a client, skipping auto-fill');
        return;
      }

      // Só carregar se os dados ainda não foram preenchidos
      if (clientData.name && clientData.phone) {
        console.log('SimpleClientDataStep - Client data already filled');
        return;
      }

      try {
        console.log('SimpleClientDataStep - Fetching client data from database');
        
        const { data: clientAuthData, error } = await supabase
          .from('client_auth')
          .select('username, name, phone, email')
          .eq('id', user.id)
          .single();

        if (!error && clientAuthData) {
          console.log('SimpleClientDataStep - Client data loaded:', {
            name: clientAuthData.username || clientAuthData.name,
            phone: clientAuthData.phone,
            email: clientAuthData.email
          });
          
          onClientDataChange({
            name: clientAuthData.username || clientAuthData.name || user.name || '',
            phone: formatPhoneNumber(clientAuthData.phone || ''),
            email: clientAuthData.email || user.email || '',
            notes: clientData.notes || ''
          });
        } else {
          console.log('SimpleClientDataStep - Using fallback user data');
          onClientDataChange({
            name: user.name || '',
            phone: formatPhoneNumber(''),
            email: user.email || '',
            notes: clientData.notes || ''
          });
        }
      } catch (error) {
        console.error('SimpleClientDataStep - Error loading client data:', error);
        onClientDataChange({
          name: user.name || '',
          phone: formatPhoneNumber(''),
          email: user.email || '',
          notes: clientData.notes || ''
        });
      }
    };

    loadClientData();
  }, [user?.id, isClient, onClientDataChange, formatPhoneNumber]);

  // Validar se pode submeter
  const canSubmit = () => {
    return selectedService && 
           selectedDate && 
           selectedTime && 
           clientData.name?.trim() && 
           clientData.phone?.trim() && 
           !isSubmitting;
  };

  if (!isClient) {
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
            <h4 className="font-semibold mb-2 text-red-800">Acesso Restrito</h4>
            <p className="text-red-600 mb-4">
              Apenas clientes podem fazer agendamentos. Você está logado como administrador.
            </p>
            <Button onClick={onCancel} variant="outline">
              Voltar
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

      {/* Dados do Cliente */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Seus Dados
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                <p className="font-medium">
                  {clientData.name || (
                    <span className="text-gray-400 flex items-center">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Carregando...
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Telefone</p>
                <p className="font-medium">
                  {clientData.phone || (
                    <span className="text-gray-400 flex items-center">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Carregando...
                    </span>
                  )}
                </p>
              </div>
            </div>

            {clientData.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">E-mail</p>
                  <p className="font-medium">{clientData.email}</p>
                </div>
              </div>
            )}
          </div>
          
          {clientData.name && clientData.phone && (
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

      {/* Debug Info - Remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-100 rounded">
          Debug: User ID: {user?.id} | Is Client: {isClient?.toString()} | 
          Can Submit: {canSubmit().toString()}
        </div>
      )}
    </div>
  );
};

export default SimpleClientDataStep;
