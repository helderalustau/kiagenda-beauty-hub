
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Salon } from '@/hooks/useSupabaseData';
import { MapPin, Phone, Star, Calendar, CheckCircle, Clock } from "lucide-react";
import ActiveAppointmentCard from './ActiveAppointmentCard';
import CompletedAppointmentCard from './CompletedAppointmentCard';

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
  
  return (
    <div className="space-y-8">
      {/* Seção Principal: Agendamentos vs Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Agendamentos Ativos */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Agendamentos de Serviços Ativos
            {activeAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {activeAppointments.length}
              </Badge>
            )}
          </h3>
          
          {activeAppointments.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeAppointments.map((appointment) => (
                <ActiveAppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50/50">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-500 mb-2">Nenhum agendamento ativo</h4>
                <p className="text-gray-400">Agende um serviço para ver seus agendamentos aqui</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna 2: Histórico de Atendimentos */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Histórico de Atendimentos Concluídos
            {completedAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {completedAppointments.length}
              </Badge>
            )}
          </h3>
          
          {completedAppointments.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {completedAppointments.map((appointment) => (
                <CompletedAppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50/50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-500 mb-2">Nenhum histórico ainda</h4>
                <p className="text-gray-400">Seus atendimentos concluídos aparecerão aqui</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default ClientDashboardContent;
