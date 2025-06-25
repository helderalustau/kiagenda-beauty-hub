
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

  const handleDateSelect = React.useCallback((date: Date | undefined) => {
    console.log('📅 Date selected in OptimizedDateTimeStep:', date?.toDateString());
    
    if (date) {
      // Verificar se a data não é no passado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        console.log('❌ Cannot select past date');
        return;
      }
    }
    
    onDateSelect(date);
  }, [onDateSelect]);

  const handleTimeSelect = React.useCallback((time: string) => {
    console.log('🕒 Time selected in OptimizedDateTimeStep:', time);
    onTimeSelect(time);
  }, [onTimeSelect]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Função para verificar se uma data deve ser desabilitada
  const isDateDisabled = React.useCallback((date: Date) => {
    return date < today;
  }, [today]);

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
                📅 Clique em uma data para selecioná-la
              </p>
            </div>
            
            <div className="border rounded-lg p-3 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                locale={ptBR}
                className="w-full"
                modifiers={{
                  today: new Date()
                }}
                modifiersStyles={{
                  today: { 
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }
                }}
              />
            </div>
            
            {selectedDate && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  ✅ Data selecionada: {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
              onTimeSelect={handleTimeSelect}
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
