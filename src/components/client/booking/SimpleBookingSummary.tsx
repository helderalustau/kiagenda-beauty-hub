
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';

interface SimpleBookingSummaryProps {
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  formatCurrency: (value: number) => string;
  className?: string;
}

const SimpleBookingSummary = ({
  selectedService,
  selectedDate,
  selectedTime,
  formatCurrency,
  className = ""
}: SimpleBookingSummaryProps) => {
  if (!selectedService || !selectedDate || !selectedTime) {
    return null;
  }

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3">Resumo do Agendamento</h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Serviço:</strong> {selectedService.name} - {formatCurrency(selectedService.price)}
          </p>
          <p>
            <strong>Data:</strong> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p>
            <strong>Horário:</strong> {selectedTime}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleBookingSummary;
