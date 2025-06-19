
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Edit } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AdminSidebar from '@/components/AdminSidebar';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import AppointmentEditor from '@/components/AppointmentEditor';
import DashboardStats from '@/components/DashboardStats';
import ServicesPage from '@/pages/ServicesPage';
import SettingsPage from '@/pages/SettingsPage';
import { useSupabaseData, Appointment } from '@/hooks/useSupabaseData';

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const { salon, appointments, services, loading, updateAppointmentStatus, refreshData } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.appointment_date), new Date())
  );

  const selectedDateAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.appointment_date), selectedDate)
  );

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'services':
        return <ServicesPage services={services} onRefresh={refreshData} />;
      case 'settings':
        return <SettingsPage salon={salon} onRefresh={refreshData} />;
      case 'appointments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
              <p className="text-gray-600">Gerencie todos os agendamentos do salão</p>
            </div>
            
            <WeeklyCalendar 
              appointments={appointments}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />

            <Card>
              <CardHeader>
                <CardTitle>
                  Agendamentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDateAppointments.length > 0 ? (
                    selectedDateAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                          appointment.status === 'cancelled' ? 'opacity-50 bg-gray-50' : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.clients?.name}</h4>
                            <p className="text-gray-600">{appointment.services?.name}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.appointment_time} • R$ {appointment.services?.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                            disabled={appointment.status === 'cancelled'}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum agendamento
                      </h3>
                      <p className="text-gray-600">
                        Não há agendamentos para esta data
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Visão geral do seu salão</p>
            </div>
            
            <DashboardStats 
              appointments={appointments}
              services={services}
              salon={salon}
            />

            <WeeklyCalendar 
              appointments={appointments}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />

            {/* Agendamentos de Hoje */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Agendamentos de Hoje</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                          appointment.status === 'cancelled' ? 'opacity-50 bg-gray-50' : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.clients?.name}</h4>
                            <p className="text-gray-600">{appointment.services?.name}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.appointment_time} • R$ {appointment.services?.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                            disabled={appointment.status === 'cancelled'}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum agendamento para hoje
                      </h3>
                      <p className="text-gray-600">
                        Os novos agendamentos aparecerão aqui
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        salonName={salon?.name || 'Salão'}
        ownerName={salon?.owner_name || 'Administrador'}
        plan={salon?.plan || 'bronze'}
      />
      
      <div className="flex-1 p-8">
        {renderContent()}
      </div>

      <AppointmentEditor
        appointment={editingAppointment}
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onUpdate={updateAppointmentStatus}
      />
    </div>
  );
};

export default AdminDashboard;
