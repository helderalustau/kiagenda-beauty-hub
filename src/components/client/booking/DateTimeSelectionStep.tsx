
import React from 'react';
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';
import TimeSlotGrid from '../TimeSlotGrid';

interface DateTimeSelectionStepProps {
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  availableTimes: string[];
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  formatCurrency: (value: number) => string;
}

const DateTimeSelectionStep = ({
  selectedService,
  selectedDate,
  selectedTime,
  availableTimes,
  onDateSelect,
  onTimeSelect,
  formatCurrency
}: DateTimeSelectionStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Escolha Data e Horário</h3>
        <p className="text-gray-600">Selecione quando deseja ser atendido</p>
      </div>

      {selectedService && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">{selectedService.name}</h4>
                <p className="text-sm text-blue-700">
                  {selectedService.duration_minutes} min • {formatCurrency(selectedService.price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium mb-3 block">Data</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Horário</Label>
          {selectedDate ? (
            <TimeSlotGrid
              availableTimes={availableTimes}
              selectedTime={selectedTime}
              onTimeSelect={onTimeSelect}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Selecione uma data primeiro</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelectionStep;
