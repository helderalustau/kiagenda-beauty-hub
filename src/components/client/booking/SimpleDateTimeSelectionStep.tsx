
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Clock, DollarSign, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';

interface SimpleDateTimeSelectionStepProps {
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  availableTimes: string[];
  loadingTimes: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  formatCurrency: (value: number) => string;
}

const SimpleDateTimeSelectionStep = ({
  selectedService,
  selectedDate,
  selectedTime,
  availableTimes,
  loadingTimes,
  onDateSelect,
  onTimeSelect,
  onNext,
  onBack,
  formatCurrency
}: SimpleDateTimeSelectionStepProps) => {
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
        <Badge variant="outline">Passo 2 de 3</Badge>
      </div>

      {selectedService && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900">Serviço Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-900">{selectedService.name}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-semibold">{formatCurrency(selectedService.price)}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{selectedService.duration_minutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Escolha a Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                console.log('Calendar date selected:', date?.toDateString());
                onDateSelect(date);
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              locale={ptBR}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Escolha o Horário
              {loadingTimes && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-gray-500 text-center py-8">
                Selecione uma data primeiro
              </p>
            ) : loadingTimes ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-gray-600 mt-2">Carregando horários...</p>
              </div>
            ) : availableTimes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum horário disponível para esta data
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTimeSelect(time)}
                    className="text-sm"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <h4 className="font-semibold text-green-900 mb-2">Resumo</h4>
              <p className="text-green-800">
                <strong>Data:</strong> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-green-800">
                <strong>Horário:</strong> {selectedTime}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!selectedDate || !selectedTime || loadingTimes}
          onClick={onNext}
          className="flex items-center"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleDateTimeSelectionStep;
