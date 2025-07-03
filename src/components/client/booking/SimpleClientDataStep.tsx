
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, ArrowLeft, CheckCircle } from "lucide-react";
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
  const { user } = useAuth();
  const { formatPhoneNumber } = usePhoneFormatter();

  // Auto-preencher dados do cliente logado
  useEffect(() => {
    const loadClientData = async () => {
      if (user && (!clientData.name || !clientData.phone)) {
        console.log('SimpleClientDataStep - Loading client data for user:', user.id);
        
        try {
          // Buscar dados do cliente na tabela client_auth
          const { data: clientAuthData, error } = await supabase
            .from('client_auth')
            .select('username, name, phone, email')
            .eq('id', user.id)
            .single();

          if (!error && clientAuthData) {
            console.log('SimpleClientDataStep - Found client auth data:', clientAuthData);
            
            onClientDataChange({
              name: clientAuthData.username || clientAuthData.name || user.name || '',
              phone: formatPhoneNumber(clientAuthData.phone || ''),
              email: clientAuthData.email || user.email || '',
              notes: clientData.notes || ''
            });
          } else {
            console.log('SimpleClientDataStep - No client auth data found, using basic user data');
            
            onClientDataChange({
              name: user.name || '',
              phone: formatPhoneNumber(''),
              email: user.email || '',
              notes: clientData.notes || ''
            });
          }
        } catch (error) {
          console.error('SimpleClientDataStep - Error loading client auth data:', error);
          
          onClientDataChange({
            name: user.name || '',
            phone: formatPhoneNumber(''),
            email: user.email || '',
            notes: clientData.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [user, onClientDataChange, formatPhoneNumber, clientData.notes, clientData.name, clientData.phone]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
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

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Resumo do Agendamento</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Serviço:</strong> {selectedService?.name} - {formatCurrency(selectedService?.price || 0)}</p>
            <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd/MM/yyyy")}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente - Apenas para visualização */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Seus Dados (Preenchidos Automaticamente)
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                <p className="font-medium">{clientData.name || 'Carregando...'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Telefone</p>
                <p className="font-medium">{clientData.phone || 'Carregando...'}</p>
              </div>
            </div>

            {clientData.email && (
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 text-gray-500">@</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">E-mail</p>
                  <p className="font-medium">{clientData.email}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 p-2 bg-green-100 rounded-lg">
            <p className="text-xs text-green-800">
              ✓ Dados carregados automaticamente do seu perfil de usuário
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Campo de Observações - Único campo editável */}
      <div>
        <Label htmlFor="notes">Observações (Opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Alguma observação adicional sobre o agendamento?"
          value={clientData.notes}
          onChange={(e) => onClientDataChange({ ...clientData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !clientData.name || !clientData.phone}
          className="flex items-center"
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
