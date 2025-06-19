import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Calendar, User, Scissors, Menu } from "lucide-react";
import ClientProfileModal from '@/components/ClientProfileModal';
import BookingModal from '@/components/BookingModal';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

const ClientDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'salons' | 'appointments'>('salons');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { salons, services, appointments, fetchAllSalons } = useSupabaseData();
  const { toast } = useToast();

  // Mock data - em produção viria do backend e seria gerenciado pelo estado global
  const mockSalons = [
    {
      id: 1,
      name: 'Bella Vista Salon',
      owner: 'Maria Silva',
      address: 'Rua das Flores, 123 - Centro',
      rating: 4.8,
      services: ['Corte', 'Coloração', 'Manicure', 'Pedicure'],
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Studio Elegance',
      owner: 'Ana Costa',
      address: 'Av. Principal, 456 - Vila Nova',
      rating: 4.6,
      services: ['Corte', 'Escova', 'Tratamentos', 'Sobrancelha'],
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Charme & Estilo',
      owner: 'Carla Santos',
      address: 'Rua da Beleza, 789 - Jardim',
      rating: 4.9,
      services: ['Corte', 'Coloração', 'Alisamento', 'Hidratação'],
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop'
    }
  ];

  const mockAppointments = [
    {
      id: 1,
      salon: 'Bella Vista Salon',
      service: 'Corte + Escova',
      date: '2024-01-15',
      time: '14:00',
      status: 'completed',
      price: 'R$ 80,00'
    },
    {
      id: 2,
      salon: 'Studio Elegance',
      service: 'Manicure',
      date: '2024-01-22',
      time: '10:30',
      status: 'confirmed',
      price: 'R$ 45,00'
    },
    {
      id: 3,
      salon: 'Charme & Estilo',
      service: 'Coloração',
      date: '2024-01-25',
      time: '15:00',
      status: 'pending',
      price: 'R$ 120,00'
    }
  ];

  useEffect(() => {
    // Carregar dados do cliente do localStorage
    const clientAuthData = localStorage.getItem('clientData');
    if (clientAuthData) {
      setClientData(JSON.parse(clientAuthData));
    }
  }, []);

  const filteredSalons = mockSalons.filter(salon => 
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = (salon: any) => {
    if (!clientData) {
      toast({
        title: "Erro",
        description: "Dados do cliente não encontrados. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedSalon(salon);
    setIsBookingModalOpen(true);
  };

  const handleProfileSave = async (profileData: { name: string; email: string; phone: string }) => {
    try {
      // Atualizar dados localmente
      const updatedClientData = { ...clientData, ...profileData };
      setClientData(updatedClientData);
      localStorage.setItem('clientData', JSON.stringify(updatedClientData));
      
      // Em produção, aqui você faria a chamada para o backend
      // Para agora, apenas atualizamos o localStorage
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-50 opacity-75';
      case 'confirmed':
        return 'bg-green-50';
      case 'pending':
        return 'bg-yellow-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header - Responsivo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-1.5 sm:p-2 rounded-lg">
                <Scissors className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant={activeTab === 'salons' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('salons')}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Salões</span>
              </Button>
              <Button
                variant={activeTab === 'appointments' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('appointments')}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Meus Agendamentos</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <Button
                  variant={activeTab === 'salons' ? 'default' : 'ghost'}
                  onClick={() => {
                    setActiveTab('salons');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Salões
                </Button>
                <Button
                  variant={activeTab === 'appointments' ? 'default' : 'ghost'}
                  onClick={() => {
                    setActiveTab('appointments');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Meus Agendamentos
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {activeTab === 'salons' ? (
          <div>
            {/* Search Section - Responsivo */}
            <div className="mb-6 sm:mb-8">
              <div className="relative w-full max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  placeholder="Buscar por salão ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 py-2 sm:py-3 text-sm sm:text-lg"
                />
              </div>
            </div>

            {/* Salons Grid - Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredSalons.map((salon) => (
                <Card key={salon.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={salon.image} 
                      alt={salon.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                      <Badge className="bg-white/90 text-gray-800 text-xs">
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {salon.rating}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">{salon.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1 text-sm">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{salon.owner}</span>
                    </CardDescription>
                    <CardDescription className="flex items-start space-x-1 text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{salon.address}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Serviços:</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {salon.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleBooking(salon)}
                      className="w-full bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-sm sm:text-base"
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Agendar Serviço
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSalons.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Nenhum salão encontrado
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Tente ajustar sua busca ou limpar os filtros
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h2>
              <p className="text-gray-600 text-sm sm:text-base">Acompanhe todos os seus serviços agendados</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {mockAppointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className={`${getStatusColor(appointment.status)} transition-shadow duration-300 hover:shadow-md`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                          appointment.status === 'completed' 
                            ? 'bg-gray-200' 
                            : appointment.status === 'confirmed'
                            ? 'bg-green-100'
                            : 'bg-yellow-100'
                        }`}>
                          <Scissors className={`h-4 w-4 sm:h-6 sm:w-6 ${
                            appointment.status === 'completed' 
                              ? 'text-gray-500' 
                              : appointment.status === 'confirmed'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">
                            {appointment.salon}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base">{appointment.service}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{appointment.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right space-x-2 sm:space-x-0">
                        <div className="text-base sm:text-lg font-semibold text-gray-900 sm:mb-2">
                          {appointment.price}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {mockAppointments.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Você ainda não possui agendamentos. Que tal marcar seu primeiro serviço?
                </p>
                <Button 
                  onClick={() => setActiveTab('salons')}
                  className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                >
                  Explorar Salões
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        clientData={clientData}
        onSave={handleProfileSave}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        salon={selectedSalon}
        services={services || []}
        clientData={clientData}
      />
    </div>
  );
};

export default ClientDashboard;
