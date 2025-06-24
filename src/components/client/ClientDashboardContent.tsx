
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Salon } from '@/hooks/useSupabaseData';
import { MapPin, Phone, Star, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import ActiveAppointmentCard from './ActiveAppointmentCard';
import CompletedAppointmentCard from './CompletedAppointmentCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showActiveAppointments, setShowActiveAppointments] = useState(false);
  
  return (
    <div className="space-y-6 pb-8">
      {/* Estabelecimentos Disponíveis - Posição Principal */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 px-4">Estabelecimentos Disponíveis</h3>
        <div className="grid grid-cols-1 gap-4 px-4">
          {salons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-lg transition-shadow bg-white border-0 shadow-sm">
              <div className="flex">
                {/* Imagem do estabelecimento */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-l-lg flex items-center justify-center flex-shrink-0">
                  {salon.banner_image_url ? (
                    <img 
                      src={salon.banner_image_url} 
                      alt={salon.name}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  ) : (
                    <Star className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                {/* Informações do estabelecimento */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{salon.name}</h4>
                      <p className="text-sm text-gray-600">{salon.owner_name}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={salon.is_open ? "default" : "secondary"} className={
                        salon.is_open 
                          ? "bg-green-100 text-green-800 text-xs" 
                          : "bg-gray-100 text-gray-600 text-xs"
                      }>
                        {salon.is_open ? "Aberto" : "Fechado"}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {salon.plan}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{salon.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{salon.phone}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => onBookService(salon)}
                    disabled={!salon.is_open}
                    className="w-full h-8 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="sm"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {salon.is_open ? "Agendar Serviço" : "Indisponível"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Agendamentos Ativos - Colapsível e Discreto */}
      {activeAppointments.length > 0 && (
        <div className="px-4">
          <Collapsible open={showActiveAppointments} onOpenChange={setShowActiveAppointments}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-12 bg-orange-50 hover:bg-orange-100 border-orange-200">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium text-orange-800">Agendamentos Aguardando</span>
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 text-xs">
                    {activeAppointments.length}
                  </Badge>
                </div>
                {showActiveAppointments ? (
                  <ChevronUp className="h-4 w-4 text-orange-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-orange-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {activeAppointments.map((appointment) => (
                <ActiveAppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Histórico - Rodapé */}
      {completedAppointments.length > 0 && (
        <div className="bg-gray-50 mt-8 pt-6 pb-4">
          <div className="px-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Histórico de Atendimentos
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                {completedAppointments.length}
              </Badge>
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {completedAppointments.map((appointment) => (
                <CompletedAppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estado vazio quando não há agendamentos */}
      {activeAppointments.length === 0 && completedAppointments.length === 0 && (
        <div className="px-4">
          <Card className="bg-gray-50/50">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-500 mb-2">Nenhum agendamento ainda</h4>
              <p className="text-gray-400">Escolha um estabelecimento acima para fazer seu primeiro agendamento</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardContent;
