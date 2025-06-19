
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Scissors, LogOut, User, Store } from "lucide-react";
import { useSupabaseData, Client, Salon, Appointment } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import ClientProfile from '@/components/ClientProfile';
import SalonList from '@/components/SalonList';
import BookingModal from '@/components/BookingModal';

const ClientDashboard = () => {
  const { 
    salons,
    categories,
    fetchAllSalons, 
    fetchCategories,
    getClientByPhone,
    fetchClientAppointments
  } = useSupabaseData();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
    fetchAllSalons();
    fetchCategories();
  }, []);

  const loadClientData = async () => {
    const clientData = localStorage.getItem('clientAuth');
    if (clientData) {
      try {
        const parsedClient = JSON.parse(clientData);
        
        // Buscar dados completos do cliente
        const clientResult = await getClientByPhone(parsedClient.name); // Assumindo que 'name' é o telefone
        if (clientResult.success) {
          setClient(clientResult.client);
          
          // Buscar agendamentos do cliente
          const appointmentsResult = await fetchClientAppointments(clientResult.client.id);
          if (appointmentsResult.success) {
            setClientAppointments(appointmentsResult.data);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        handleLogout();
      }
    } else {
      handleLogout();
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('clientAuth');
    window.location.href = '/';
  };

  const handleBookService = (salon: Salon) => {
    setSelectedSalon(salon);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSalon(null);
    loadClientData(); // Recarregar appointments
    toast({
      title: "Sucesso",
      description: "Agendamento realizado com sucesso!"
    });
  };

  const handleClientUpdate = (updatedClient: Client) => {
    setClient(updatedClient);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Confirmado</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Erro ao carregar dados do cliente</p>
            <Button onClick={handleLogout}>Voltar ao Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  Área do Cliente
                </h1>
                <p className="text-sm text-gray-600">Olá, {client.name}!</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="establishments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="establishments" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Estabelecimentos</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Meus Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Meu Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="establishments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Estabelecimentos Disponíveis
              </h2>
              <p className="text-gray-600">
                Encontre e agende serviços nos melhores estabelecimentos da sua região
              </p>
            </div>
            
            <SalonList 
              salons={salons.filter(salon => salon.is_open)} 
              categories={categories}
              onBookService={handleBookService}
            />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Meus Agendamentos
              </h2>
              <p className="text-gray-600">
                Acompanhe o status dos seus agendamentos
              </p>
            </div>

            <div className="grid gap-4">
              {clientAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{appointment.service?.name}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{appointment.salon?.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Observações:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          R$ {appointment.service?.price?.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.service?.duration_minutes} min
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {clientAppointments.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum agendamento encontrado
                    </h3>
                    <p className="text-gray-600">
                      Você ainda não possui agendamentos. Navegue pela aba "Estabelecimentos" para fazer seu primeiro agendamento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Meu Perfil
              </h2>
              <p className="text-gray-600">
                Gerencie suas informações pessoais
              </p>
            </div>
            
            <ClientProfile client={client} onUpdate={handleClientUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Agendamento */}
      {showBookingModal && selectedSalon && (
        <BookingModal
          salon={selectedSalon}
          clientName={client.name}
          clientPhone={client.phone}
          clientEmail={client.email}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSalon(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
