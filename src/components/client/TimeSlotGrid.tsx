
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeSlotGridProps {
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const TimeSlotGrid = ({ 
  availableTimes, 
  selectedTime, 
  onTimeSelect, 
  selectedDate,
  loading = false,
  error = null,
  onRetry
}: TimeSlotGridProps) => {
  console.log('TimeSlotGrid - Rendering with:', { 
    availableTimesCount: availableTimes?.length || 0, 
    selectedTime, 
    selectedDate: selectedDate?.toDateString(),
    loading,
    error,
    availableTimes
  });

  if (!selectedDate) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Selecione uma data para ver os horários disponíveis</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando horários disponíveis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <div className="space-y-3">
          <p className="text-amber-600 font-medium">{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Tentar novamente</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!availableTimes || availableTimes.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">
            Nenhum horário disponível para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
          <p className="text-sm text-gray-500">
            Este estabelecimento pode estar fechado neste dia ou todos os horários já estão ocupados.
          </p>
          <p className="text-sm text-blue-600">
            Tente selecionar outra data.
          </p>
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="mt-3 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar horários</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Organizar horários por período
  const morningSlots = availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 6 && hour < 12;
  });

  const afternoonSlots = availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 12 && hour < 18;
  });

  const eveningSlots = availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 18 && hour <= 23;
  });

  const TimeSlotSection = ({ title, slots }: { title: string; slots: string[] }) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          {title} ({slots.length} {slots.length === 1 ? 'horário' : 'horários'})
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log('TimeSlotGrid - Time selected:', time);
                onTimeSelect(time);
              }}
              className={`text-sm transition-all duration-200 ${
                selectedTime === time
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md scale-105'
                  : 'hover:bg-blue-50 hover:border-blue-300 hover:scale-102'
              }`}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Horários Disponíveis
        </h3>
        <p className="text-sm text-gray-600">
          {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg mb-4 flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        {availableTimes.length} horário{availableTimes.length !== 1 ? 's' : ''} disponível{availableTimes.length !== 1 ? 'eis' : ''} 
        {selectedDate.toDateString() === new Date().toDateString() && (
          <span className="ml-2 text-amber-600">• Horários passados não são exibidos</span>
        )}
      </div>

      <TimeSlotSection title="Manhã" slots={morningSlots} />
      <TimeSlotSection title="Tarde" slots={afternoonSlots} />
      <TimeSlotSection title="Noite" slots={eveningSlots} />
    </div>
  );
};

export default TimeSlotGrid;
