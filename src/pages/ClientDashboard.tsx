
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Calendar, User, Scissors } from "lucide-react";

const ClientDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'salons' | 'appointments'>('salons');

  // Mock data - em produção viria do backend
  const salons = [
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

  const appointments = [
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
      status: 'upcoming',
      price: 'R$ 45,00'
    },
    {
      id: 3,
      salon: 'Charme & Estilo',
      service: 'Coloração',
      date: '2024-01-25',
      time: '15:00',
      status: 'upcoming',
      price: 'R$ 120,00'
    }
  ];

  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = (salonId: number) => {
    // Em produção, abriria modal de agendamento
    alert(`Agendamento para o salão ${salons.find(s => s.id === salonId)?.name} será implementado!`);
  };

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'salons' ? (
          <div>
            {/* Search Section */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por salão ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg"
                />
              </div>
            </div>

            {/* Salons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => (
                <Card key={salon.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={salon.image} 
                      alt={salon.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-800">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {salon.rating}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{salon.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{salon.owner}</span>
                    </CardDescription>
                    <CardDescription className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{salon.address}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Serviços:</h4>
                      <div className="flex flex-wrap gap-2">
                        {salon.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleBooking(salon.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Serviço
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSalons.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum salão encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar sua busca ou limpar os filtros
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h2>
              <p className="text-gray-600">Acompanhe todos os seus serviços agendados</p>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className={`${
                    appointment.status === 'completed' 
                      ? 'bg-gray-50 opacity-75' 
                      : 'bg-white hover:shadow-md'
                  } transition-shadow duration-300`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          appointment.status === 'completed' 
                            ? 'bg-gray-200' 
                            : 'bg-blue-100'
                        }`}>
                          <Scissors className={`h-6 w-6 ${
                            appointment.status === 'completed' 
                              ? 'text-gray-500' 
                              : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {appointment.salon}
                          </h3>
                          <p className="text-gray-600">{appointment.service}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                          {appointment.price}
                        </div>
                        <Badge 
                          variant={appointment.status === 'completed' ? 'secondary' : 'default'}
                        >
                          {appointment.status === 'completed' ? 'Concluído' : 'Agendado'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {appointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
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
    </div>
  );
};

export default ClientDashboard;
