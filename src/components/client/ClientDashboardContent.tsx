
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Salon } from '@/hooks/useSupabaseData';
import { MapPin, Clock, Phone, Star, Calendar, CheckCircle, AlertCircle, Clock4 } from "lucide-react";
import ActiveAppointmentCard from './ActiveAppointmentCard';

interface ClientDashboardContentProps {
  salons: Salon[];
  onBookService: (salon: Salon) => void;
  activeAppointments: any[];
  completedAppointments: any[];
}

const ClientDashboardContent = ({ 
  salons, 
  onBookService, 
  activeAppointments, 
  completedAppointments 
}: ClientDashboardContentProps) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Separar agendamentos ativos por status
  const pendingAppointments = activeAppointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = activeAppointments.filter(apt => apt.status === 'confirmed');

  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Aguardando Aprovação</p>
                <p className="text-2xl font-bold text-orange-900">{pendingAppointments.length}</p>
              </div>
              <Clock4 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Agendamentos Confirmados</p>
                <p className="text-2xl font-bold text-blue-900">{confirmedAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Atendimentos Concluídos</p>
                <p className="text-2xl font-bold text-green-900">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos Ativos */}
      {activeAppointments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Seus Agendamentos Ativos
          </h3>
          <div className="space-y-4">
            {activeAppointments.map((appointment) => (
              <ActiveAppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {/* Estabelecimentos Disponíveis */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Estabelecimentos Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                {salon.banner_image_url ? (
                  <img 
                    src={salon.banner_image_url} 
                    alt={salon.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Imagem do estabelecimento</p>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{salon.name}</h4>
                    <p className="text-sm text-gray-600">{salon.owner_name}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{salon.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{salon.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={salon.is_open ? "default" : "secondary"} className={
                      salon.is_open 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }>
                      {salon.is_open ? "Aberto" : "Fechado"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {salon.plan}
                    </Badge>
                  </div>

                  <Button 
                    onClick={() => onBookService(salon)}
                    disabled={!salon.is_open}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {salon.is_open ? "Agendar Serviço" : "Indisponível"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Histórico de Agendamentos Concluídos */}
      {completedAppointments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Histórico de Atendimentos
          </h3>
          <div className="space-y-3">
            {completedAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.salon?.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.service?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(appointment.service?.price || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-800 mb-2">
                        Concluído
                      </Badge>
                      <Button variant="outline" size="sm" className="block">
                        <Star className="h-4 w-4 mr-1" />
                        Avaliar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardContent;
