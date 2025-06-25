
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, Calendar as CalendarIcon, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';
import OptimizedTimeSlotGrid from './OptimizedTimeSlotGrid';

interface OptimizedDateTimeStepProps {
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  availableTimes: string[];
  loading?: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  formatCurrency: (value: number) => string;
  onContinue: () => void;
}

const OptimizedDateTimeStep = ({
  selectedService,
  selectedDate,
  selectedTime,
  availableTimes,
  loading = false,
  onDateSelect,
  onTimeSelect,
  onBack,
  formatCurrency,
  onContinue
}: OptimizedDateTimeStepProps) => {
  const canContinue = selectedDate && selectedTime && !loading;

  const handleDateSelect = (date: Date | undefined) => {
    console.log('📅 OptimizedDateTimeStep - Date selection:', date?.toDateString());
    onDateSelect(date);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Badge variant="outline" className="text-sm">
          Passo 2 de 3
        </Badge>
      </div>

      {selectedService && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
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
          <CardContent className="p-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                📅 Selecione uma data para continuar
              </p>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                return date < today;
              }}
              locale={ptBR}
              className="rounded-md border w-full pointer-events-auto"
              classNames={{
                months: "flex w-full",
                month: "w-full",
                table: "w-full",
                head_row: "flex w-full",
                head_cell: "flex-1 text-center",
                row: "flex w-full mt-2",
                cell: "flex-1 h-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              }}
            />
            {selectedDate && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Data selecionada: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Escolha o Horário
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OptimizedTimeSlotGrid
              availableTimes={availableTimes}
              selectedTime={selectedTime}
              onTimeSelect={onTimeSelect}
              selectedDate={selectedDate}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Resumo do Agendamento
              </h4>
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
          disabled={!canContinue}
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center px-8"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OptimizedDateTimeStep;
