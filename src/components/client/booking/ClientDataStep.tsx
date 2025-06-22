
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
import { useClientData } from '@/hooks/useClientData';

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
  const { getClientByPhone } = useClientData();

  // Auto-preencher com dados do cliente logado
  useEffect(() => {
    const loadClientData = async () => {
      if (user) {
        console.log('ClientDataStep - Auto-filling client data from logged user:', user);
        
        // Tentar buscar dados reais do cliente
        const clientResult = await getClientByPhone(user.id);
        
        if (clientResult.success && clientResult.client) {
          // Usar dados reais do cliente
          onClientDataChange({
            name: clientResult.client.name || user.name || '',
            phone: clientResult.client.phone || '',
            email: clientResult.client.email || '',
            notes: clientData.notes || ''
          });
        } else {
          // Dados básicos apenas
          onClientDataChange({
            name: user.name || '',
            phone: '', // Deixar vazio para preenchimento manual
            email: '',
            notes: clientData.notes || ''
          });
        }
      }
    };

    loadClientData();
  }, [user, onClientDataChange, getClientByPhone]);

  // Função para formatar telefone brasileiro
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,5})/, '($1) $2')
        .replace(/(\d{2})/, '($1');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onClientDataChange({ ...clientData, phone: formatted });
  };

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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Seus Dados</h3>
          <p className="text-gray-600">Confirme seus dados para finalizar o agendamento</p>
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

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Nome Completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientName"
                type="text"
                placeholder="Seu nome completo"
                value={clientData.name}
                onChange={(e) => onClientDataChange({ ...clientData, name: e.target.value })}
                className="pl-10"
                required
                readOnly={!!user?.name}
              />
            </div>
            {user?.name && (
              <p className="text-xs text-green-600 mt-1">✓ Preenchido automaticamente</p>
            )}
          </div>

          <div>
            <Label htmlFor="clientPhone">Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientPhone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={clientData.phone}
                onChange={handlePhoneChange}
                className="pl-10"
                required
                maxLength={15}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Formato: (11) 99999-9999</p>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Alguma observação adicional?"
            value={clientData.notes}
            onChange={(e) => onClientDataChange({ ...clientData, notes: e.target.value })}
            rows={3}
          />
        </div>
      </form>
    </div>
  );
};

export default ClientDataStep;
