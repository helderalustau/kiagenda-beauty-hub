
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeSlotGridProps {
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
}

const TimeSlotGrid = ({ availableTimes, selectedTime, onTimeSelect, selectedDate }: TimeSlotGridProps) => {
  if (!selectedDate) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Selecione uma data para ver os horários disponíveis</p>
      </div>
    );
  }

  if (availableTimes.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Nenhum horário disponível para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Este estabelecimento pode estar fechado neste dia. Tente selecionar outra data.
        </p>
      </div>
    );
  }

  const morningSlots = availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 12 && hour < 18;
  });

  const eveningSlots = availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 18;
  });

  const TimeSlotSection = ({ title, slots }: { title: string; slots: string[] }) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          {title}
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {slots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeSelect(time)}
              className={`text-sm transition-all ${
                selectedTime === time
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
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

      <TimeSlotSection title="Manhã" slots={morningSlots} />
      <TimeSlotSection title="Tarde" slots={afternoonSlots} />
      <TimeSlotSection title="Noite" slots={eveningSlots} />
    </div>
  );
};

export default TimeSlotGrid;
