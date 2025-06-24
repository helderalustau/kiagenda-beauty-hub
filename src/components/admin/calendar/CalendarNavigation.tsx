
import React from 'react';
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarNavigationProps {
  currentWeek: Date;
  viewMode: 'week' | 'day';
  onWeekChange: (date: Date) => void;
  onViewModeChange: (mode: 'week' | 'day') => void;
}

const CalendarNavigation = ({ 
  currentWeek, 
  viewMode, 
  onWeekChange, 
  onViewModeChange 
}: CalendarNavigationProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(subWeeks(currentWeek, 1))}
        >
          ←
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(addWeeks(currentWeek, 1))}
        >
          →
        </Button>
        <span className="font-medium">
          {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM", { locale: ptBR })} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('week')}
        >
          Semana
        </Button>
        <Button
          variant={viewMode === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('day')}
        >
          Dia
        </Button>
      </div>
    </div>
  );
};

export default CalendarNavigation;
