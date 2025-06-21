
import React from 'react';
import { Clock, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  onBack: () => void;
  formatCurrency: (value: number) => string;
}

const DateTimeSelectionStep = ({
  selectedService,
  selectedDate,
  selectedTime,
  availableTimes,
  onDateSelect,
  onTimeSelect,
  onBack,
  formatCurrency
}: DateTimeSelectionStepProps) => {
  console.log('DateTimeSelectionStep - Props:', { 
    selectedService: selectedService?.name, 
    selectedDate, 
    selectedTime, 
    availableTimes 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Serviços
        </Button>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Escolha Data e Horário</h3>
          <p className="text-gray-600">Selecione quando deseja ser atendido</p>
        </div>
        <div></div> {/* Spacer for centering */}
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
            onSelect={(date) => {
              console.log('DateTimeSelectionStep - Date selected:', date);
              onDateSelect(date);
            }}
            disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Horário</Label>
          <TimeSlotGrid
            availableTimes={availableTimes}
            selectedTime={selectedTime}
            onTimeSelect={onTimeSelect}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelectionStep;
