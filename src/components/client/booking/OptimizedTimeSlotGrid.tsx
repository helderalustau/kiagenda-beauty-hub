
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OptimizedTimeSlotGridProps {
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const OptimizedTimeSlotGrid = ({ 
  availableTimes, 
  selectedTime, 
  onTimeSelect, 
  selectedDate,
  loading = false,
  error = null,
  onRetry
}: OptimizedTimeSlotGridProps) => {
  console.log('OptimizedTimeSlotGrid - Rendering with:', { 
    availableTimesCount: availableTimes?.length || 0, 
    selectedTime, 
    selectedDate: selectedDate?.toDateString(),
    loading,
    error
  });

  if (!selectedDate) {
    return (
      <div className="text-center py-6">
        <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Selecione uma data para ver os horários</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">Carregando horários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <div className="space-y-2">
          <p className="text-amber-600 text-sm font-medium">{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="text-xs">Tentar novamente</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!availableTimes || availableTimes.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <div className="space-y-2">
          <p className="text-gray-600 font-medium text-sm">
            Nenhum horário disponível
          </p>
          <p className="text-xs text-gray-500">
            Para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
          <p className="text-xs text-blue-600">
            Tente outra data ou horário
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="text-xs">Atualizar</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {availableTimes.length} horário{availableTimes.length !== 1 ? 's' : ''} disponível{availableTimes.length !== 1 ? 'eis' : ''}
        {selectedDate.toDateString() === new Date().toDateString() && (
          <span className="ml-2 text-amber-600">• Apenas horários futuros</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {availableTimes.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            size="sm"
            onClick={() => {
              console.log('OptimizedTimeSlotGrid - Time selected:', time);
              onTimeSelect(time);
            }}
            className={`text-xs transition-all duration-200 ${
              selectedTime === time
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm scale-105'
                : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default OptimizedTimeSlotGrid;
