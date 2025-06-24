
import React, { useEffect } from 'react';
import { User, Phone, CalendarIcon, Clock, Scissors, MapPin, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service, Salon } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClientDataStepProps {
  salon: Salon;
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  clientData: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  onClientDataChange: (data: { name: string; phone: string; email: string; notes: string }) => void;
  onBack: () => void;
  formatCurrency: (value: number) => string;
  onSubmit: (e: React.FormEvent) => void;
}

const ClientDataStep = ({
  salon,
  selectedService,
  selectedDate,
  selectedTime,
  clientData,
  onClientDataChange,
  onBack,
  formatCurrency,
  onSubmit
}: ClientDataStepProps) => {
  const { user } = useAuth();

  // Auto-preencher com dados do cliente logado
  useEffect(() => {
    const loadClientData = async () => {
      if (user) {
        console.log('ClientDataStep - Auto-filling client data from logged user:', user);
        
        try {
          // Buscar dados do cliente na tabela client_auth
          const { data: clientAuthData, error } = await supabase
            .from('client_auth')
            .select('username, name, phone, email')
            .eq('id', user.id)
            .single();

          if (!error && clientAuthData) {
            console.log('Found client auth data:', clientAuthData);
            onClientDataChange({
              name: clientAuthData.username || clientAuthData.name || '',
              phone: clientAuthData.phone || '',
              email: clientAuthData.email || '',
              notes: clientData.notes || ''
            });
          } else {
            console.log('No client auth data found, using basic user data');
            onClientDataChange({
              name: user.name || '',
              phone: '',
              email: '',
              notes: clientData.notes || ''
            });
          }
        } catch (error) {
          console.error('Error loading client auth data:', error);
          onClientDataChange({
            name: user.name || '',
            phone: '',
            email: '',
            notes: clientData.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [user, onClientDataChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Horário
        </Button>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirmar Agendamento</h3>
          <p className="text-gray-600">Revise os dados e adicione observações se necessário</p>
        </div>
        <div></div>
      </div>

      {/* Resumo do agendamento */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{salon.name}</span>
            </div>
            <div className="flex items-center">
              <Scissors className="h-4 w-4 mr-2 text-gray-500" />
              <span>{selectedService?.name} - {formatCurrency(selectedService?.price || 0)}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>{selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{selectedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente - Somente Leitura */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <User className="h-4 w-4 mr-2 text-green-600" />
            Seus Dados (Preenchidos Automaticamente)
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName" className="text-sm text-gray-600">Nome de Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientName"
                    type="text"
                    value={clientData.name}
                    className="pl-10 bg-gray-50 text-gray-600"
                    readOnly
                  />
                </div>
                <p className="text-xs text-green-600 mt-1">✓ Dados do seu perfil</p>
              </div>

              <div>
                <Label htmlFor="clientPhone" className="text-sm text-gray-600">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientData.phone || 'Não informado'}
                    className="pl-10 bg-gray-50 text-gray-600"
                    readOnly
                  />
                </div>
                {clientData.phone ? (
                  <p className="text-xs text-green-600 mt-1">✓ Dados do seu perfil</p>
                ) : (
                  <p className="text-xs text-orange-600 mt-1">⚠ Telefone não cadastrado no perfil</p>
                )}
              </div>
            </div>

            {clientData.email && (
              <div>
                <Label htmlFor="clientEmail" className="text-sm text-gray-600">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientData.email}
                  className="bg-gray-50 text-gray-600"
                  readOnly
                />
                <p className="text-xs text-green-600 mt-1">✓ Dados do seu perfil</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="notes">Observações (Opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Alguma observação adicional sobre o agendamento?"
            value={clientData.notes}
            onChange={(e) => onClientDataChange({ ...clientData, notes: e.target.value })}
            rows={3}
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ex: Preferência de horário, necessidades especiais, etc.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Importante:</strong> Seus dados pessoais são preenchidos automaticamente com base no seu perfil de usuário.
          </p>
          <p className="text-xs text-blue-600">
            Para alterar seus dados pessoais, acesse a seção "Meu Perfil" no painel principal.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ClientDataStep;
