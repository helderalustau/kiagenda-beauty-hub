
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowRight, ArrowLeft, CalendarIcon, Clock, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from '@/hooks/useSupabaseData';

interface SimpleDateTimeSelectionStepProps {
  selectedService: Service | null;
  selectedAdditionalServices?: Service[];
  selectedDate: Date | undefined;
  selectedTime: string;
  availableTimes: string[];
  loadingTimes: boolean;
  timeSlotsError: string | null;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  formatCurrency: (value: number) => string;
  refetchSlots: () => void;
}

const SimpleDateTimeSelectionStep = ({
  selectedService,
  selectedAdditionalServices = [],
  selectedDate,
  selectedTime,
  availableTimes,
  loadingTimes,
  timeSlotsError,
  onDateSelect,
  onTimeSelect,
  onNext,
  onBack,
  formatCurrency,
  refetchSlots
}: SimpleDateTimeSelectionStepProps) => {
  const totalPrice = (selectedService?.price || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.price, 0);
  
  const totalDuration = (selectedService?.duration_minutes || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.duration_minutes, 0);

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
        
        <Badge variant="outline" className="text-sm">
          Passo 3 de 4
        </Badge>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-center mb-2">Escolha a Data e Horário</h3>
        <p className="text-gray-600 text-center mb-6">
          Selecione quando deseja realizar o(s) serviço(s)
        </p>
      </div>

      {/* Resumo dos Serviços */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900">Resumo dos Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">{selectedService?.name}</span>
              <span className="text-green-600 font-semibold">{formatCurrency(selectedService?.price || 0)}</span>
            </div>
            
            {selectedAdditionalServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm">
                <span className="text-blue-800">+ {service.name}</span>
                <span className="text-green-600 font-semibold">{formatCurrency(service.price)}</span>
              </div>
            ))}
            
            <hr className="border-blue-200" />
            <div className="flex justify-between items-center font-bold">
              <div className="flex items-center text-blue-900">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Total:</span>
              </div>
              <span className="text-green-600">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-1" />
                <span>Duração:</span>
              </div>
              <span className="text-blue-700">{totalDuration} minutos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Seleção de Data */}
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
              onSelect={onDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Seleção de Horário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Escolha o Horário
              </div>
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetchSlots}
                  disabled={loadingTimes}
                  className="flex items-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loadingTimes ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Selecione uma data primeiro</p>
              </div>
            ) : loadingTimes ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando horários disponíveis...</p>
              </div>
            ) : timeSlotsError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-2">Erro ao carregar horários</p>
                <p className="text-sm text-gray-600 mb-4">{timeSlotsError}</p>
                <Button onClick={refetchSlots} variant="outline" size="sm">
                  Tentar novamente
                </Button>
              </div>
            ) : availableTimes.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Nenhum horário disponível</p>
                <p className="text-sm text-gray-500">
                  {selectedDate ? `para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}` : ''}
                </p>
                <Button onClick={refetchSlots} variant="outline" size="sm" className="mt-4">
                  Verificar novamente
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTimeSelect(time)}
                    className={`text-sm ${
                      selectedTime === time
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-blue-50'
                    }`}
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
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <h4 className="font-semibold text-green-900 mb-2">Data e Horário Selecionados</h4>
              <p className="text-green-800">
                <strong>{format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
              </p>
              <p className="text-green-800">
                <strong>às {selectedTime}</strong>
              </p>
              <p className="text-sm text-green-700 mt-2">
                Duração total: {totalDuration} minutos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!selectedDate || !selectedTime || loadingTimes}
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center px-8"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleDateTimeSelectionStep;
