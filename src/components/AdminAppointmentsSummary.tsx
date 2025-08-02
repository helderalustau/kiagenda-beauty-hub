
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/hooks/useSupabaseData';
import EnhancedAppointmentCard from './admin/EnhancedAppointmentCard';

interface AdminAppointmentsSummaryProps {
  appointments: Appointment[];
  selectedDate: Date;
  loading: boolean;
  showFutureOnly?: boolean;
  onUpdateStatus?: (id: string, status: string) => void;
}

const AdminAppointmentsSummary = ({ 
  appointments, 
  selectedDate, 
  loading, 
  showFutureOnly = false,
  onUpdateStatus
}: AdminAppointmentsSummaryProps) => {
  // Filtrar agendamentos baseado na prop showFutureOnly
  const filteredAppointments = React.useMemo(() => {
    if (showFutureOnly) {
      // Para próximos agendamentos: apenas datas futuras
      return appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return isFuture(aptDate);
      });
    } else {
      // Para agenda de hoje: apenas agendamentos de hoje
      return appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return isToday(aptDate);
      });
    }
  }, [appointments, showFutureOnly]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {showFutureOnly ? 'Próximos Agendamentos' : 'Agendamentos de Hoje'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const titleText = showFutureOnly 
    ? 'Próximos Agendamentos' 
    : `Agendamentos para Hoje - ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {titleText}
          </div>
          <Badge variant="outline" className="ml-2">
            {filteredAppointments.length} agendamento{filteredAppointments.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {showFutureOnly ? 'Nenhum agendamento futuro' : 'Nenhum agendamento para hoje'}
            </h3>
            <p className="text-gray-500">
              {showFutureOnly ? 'Não há agendamentos futuros no momento.' : 'Você está livre para hoje! 🎉'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments
              .sort((a, b) => {
                // Ordenar por data e depois por horário
                const dateCompare = new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
                if (dateCompare !== 0) return dateCompare;
                return a.appointment_time.localeCompare(b.appointment_time);
              })
              .map((appointment) => (
                <EnhancedAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onUpdateStatus={onUpdateStatus}
                  showActions={true}
                  compact={showFutureOnly}
                />
              ))}
            
            {!showFutureOnly && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredAppointments.filter(apt => apt.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-blue-800">Confirmados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredAppointments.filter(apt => apt.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-800">Pendentes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {filteredAppointments.filter(apt => apt.status === 'completed').length}
                    </div>
                    <div className="text-sm text-green-800">Concluídos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {filteredAppointments.filter(apt => apt.status === 'cancelled').length}
                    </div>
                    <div className="text-sm text-red-800">Cancelados</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAppointmentsSummary;
