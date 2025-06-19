
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/hooks/useSupabaseData';

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  onRefresh?: () => void;
}

const WeeklyCalendar = ({ appointments, onDateSelect, selectedDate, onRefresh }: WeeklyCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const hasAppointments = (date: Date) => {
    return appointments.some(apt => 
      isSameDay(new Date(apt.appointment_date), date)
    );
  };

  const currentMonth = format(currentWeek, 'MMMM yyyy', { locale: ptBR });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Calendário Semanal</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium capitalize">{currentMonth}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const hasApts = hasAppointments(day);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={index}
                className={`p-4 text-center rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : hasApts 
                      ? 'border-green-300 bg-green-50 hover:border-green-400' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                onClick={() => onDateSelect?.(day)}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
                {hasApts && (
                  <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalendar;
