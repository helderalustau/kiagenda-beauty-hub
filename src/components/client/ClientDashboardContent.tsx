
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Phone, User } from "lucide-react";
import { Salon, Appointment, Service } from '@/hooks/useSupabaseData';
import { formatPhone } from '@/utils/phoneFormatter';
import PendingAppointments from './PendingAppointments';
import ModernBookingModal from './ModernBookingModal';

interface ClientDashboardContentProps {
  salons: Salon[];
  onBookService: (salon: Salon) => void;
  activeAppointments: Appointment[];
  completedAppointments: Appointment[];
}

const ClientDashboardContent = ({
  salons,
  onBookService,
  activeAppointments,
  completedAppointments
}: ClientDashboardContentProps) => {
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [salonServices, setSalonServices] = useState<Service[]>([]);

  // Pegar ID do cliente do localStorage
  const getClientId = () => {
    const clientAuth = localStorage.getItem('clientAuth');
    if (clientAuth) {
      try {
        const client = JSON.parse(clientAuth);
        return client.id;
      } catch (error) {
        console.error('Error parsing clientAuth:', error);
      }
    }
    return null;
  };

  const clientId = getClientId();

  const handleBookService = async (salon: Salon) => {
    try {
      // Buscar serviços do salão
      const response = await fetch(`/api/salons/${salon.id}/services`);
      if (response.ok) {
        const services = await response.json();
        setSalonServices(services);
      } else {
        // Fallback para serviços mockados se a API não estiver disponível
        setSalonServices([
          {
            id: '1',
            salon_id: salon.id,
            name: 'Corte Masculino',
            description: 'Corte tradicional masculino',
            price: 25,
            duration_minutes: 30,
            active: true
          },
          {
            id: '2',
            salon_id: salon.id,
            name: 'Barba',
            description: 'Aparar e modelar barba',
            price: 15,
            duration_minutes: 20,
            active: true
          }
        ]);
      }
      
      setSelectedSalon(salon);
      setIsBookingModalOpen(true);
    } catch (error) {
      console.error('Error loading salon services:', error);
      // Usar serviços mockados em caso de erro
      setSalonServices([
        {
          id: '1',
          salon_id: salon.id,
          name: 'Corte Masculino',
          description: 'Corte tradicional masculino',
          price: 25,
          duration_minutes: 30,
          active: true
        }
      ]);
      setSelectedSalon(salon);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSuccess = () => {
    // Atualizar lista de agendamentos
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Agendamentos Pendentes */}
      {clientId && activeAppointments.length > 0 && (
        <PendingAppointments 
          clientId={clientId}
          appointments={activeAppointments}
        />
      )}

      {/* Meus Agendamentos Ativos */}
      {activeAppointments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Meus Agendamentos
          </h3>
          
          <div className="grid gap-4">
            {activeAppointments.filter(apt => apt.status === 'confirmed').map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-green-500 bg-green-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-900">
                      {appointment.salon?.name}
                    </CardTitle>
                    <Badge className="bg-green-600">
                      Confirmado
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <p className="font-medium">{appointment.service?.name}</p>
                    <p className="text-sm text-gray-600">
                      {appointment.service?.duration_minutes} min - R$ {appointment.service?.price}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-600">
                      📅 {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-blue-600">
                      🕒 {appointment.appointment_time}
                    </span>
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Observações:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Estabelecimentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Estabelecimentos Disponíveis
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Banner no topo */}
              {salon.banner_image_url && (
                <div className="h-32 bg-cover bg-center" 
                     style={{ backgroundImage: `url(${salon.banner_image_url})` }}>
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {salon.name}
                  </CardTitle>
                  <Badge variant={salon.is_open ? "default" : "secondary"}>
                    {salon.is_open ? "Aberto" : "Fechado"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{salon.address}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{formatPhone(salon.phone)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>{salon.owner_name}</span>
                </div>
                
                <Button
                  onClick={() => handleBookService(salon)}
                  disabled={!salon.is_open}
                  className="w-full mt-4"
                >
                  {salon.is_open ? "Agendar Serviço" : "Estabelecimento Fechado"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Histórico de Agendamentos */}
      {completedAppointments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Agendamentos
          </h3>
          
          <div className="grid gap-4">
            {completedAppointments.slice(0, 5).map((appointment) => (
              <Card key={appointment.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{appointment.salon?.name}</p>
                      <p className="text-sm text-gray-600">{appointment.service?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-300">
                      Concluído
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {selectedSalon && (
        <ModernBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedSalon(null);
            setSalonServices([]);
          }}
          salon={selectedSalon}
          services={salonServices}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ClientDashboardContent;
