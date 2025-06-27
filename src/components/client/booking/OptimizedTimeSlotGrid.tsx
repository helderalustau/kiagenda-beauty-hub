
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OptimizedTimeSlotGridProps {
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
  loading?: boolean;
  error?: string | null;
}

const OptimizedTimeSlotGrid = ({
  availableTimes,
  selectedTime,
  onTimeSelect,
  selectedDate,
  loading = false,
  error = null
}: OptimizedTimeSlotGridProps) => {
  
  // Função para formatar horário
  const formatTime = (timeString: string) => {
    try {
      // Parse time string (HH:MM:SS or HH:MM)
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  // Estado de loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Carregando horários disponíveis...</p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-red-700">Erro ao carregar horários</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Se não há data selecionada
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Clock className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600">Selecione uma data primeiro</p>
      </div>
    );
  }

  // Se não há horários disponíveis
  if (!availableTimes || availableTimes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Clock className="h-8 w-8 text-orange-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-orange-700">Nenhum horário disponível</p>
          <p className="text-xs text-orange-600 mt-1">
            Não há horários livres para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
    );
  }

  console.log('🕒 Rendering time slots:', availableTimes);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-blue-700">
          ⏰ Horários disponíveis em intervalos de 30 minutos
        </p>
        {selectedDate && (
          <p className="text-xs text-blue-600 mt-1">
            Data: {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {availableTimes.map((time) => {
          const formattedTime = formatTime(time);
          const isSelected = selectedTime === time;
          
          return (
            <Button
              key={time}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log('🕒 Time slot clicked:', time);
                onTimeSelect(time);
              }}
              className={`
                h-12 transition-all duration-200 hover:scale-105
                ${isSelected 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                  : 'hover:bg-blue-50 hover:border-blue-300'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <Clock className="h-3 w-3 mb-1" />
                <span className="text-xs font-medium">{formattedTime}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {selectedTime && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <Clock className="h-3 w-3 mr-1" />
              Horário selecionado
            </Badge>
            <span className="text-sm font-medium text-green-800">
              {formatTime(selectedTime)}
            </span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        💡 Dica: Os horários consideram a duração do serviço selecionado
      </div>
    </div>
  );
};

export default OptimizedTimeSlotGrid;
