
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Service } from '@/hooks/useSupabaseData';

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
        <h3 className="text-xl font-semibold">Seus Dados</h3>
        <p className="text-gray-600">Confirme seus dados para finalizar</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome Completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={clientData.name}
              onChange={(e) => onClientDataChange({ ...clientData, name: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Telefone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={clientData.phone}
              onChange={(e) => onClientDataChange({ ...clientData, phone: formatPhoneNumber(e.target.value) })}
              className="pl-10"
              required
              maxLength={15}
            />
          </div>
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
