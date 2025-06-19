
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Scissors, ArrowLeft, CheckCircle } from "lucide-react";
import { useSupabaseData, Client, Salon, Service } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import ClientHeader from '@/components/ClientHeader';

const ClientBooking = () => {
  const { 
    salons,
    categories,
    fetchAllSalons, 
    fetchCategories,
    getClientByPhone,
    fetchSalonServices,
    createAppointment
  } = useSupabaseData();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [salonServices, setSalonServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Salão, 2: Serviço, 3: Data/Hora, 4: Confirmação
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
        const clientResult = await getClientByPhone(parsedClient.name);
        if (clientResult.success) {
          setClient(clientResult.client);
        } else {
          handleLogout();
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

  const handleClientUpdate = (updatedClient: Client) => {
    setClient(updatedClient);
  };

  const handleSalonSelect = async (salon: Salon) => {
    setSelectedSalon(salon);
    const services = await fetchSalonServices(salon.id);
    setSalonServices(services);
    setBookingStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingStep(3);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleBookingSubmit = async () => {
    if (!selectedSalon || !selectedService || !selectedDate || !selectedTime || !client) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await createAppointment({
      salon_id: selectedSalon.id,
      client_id: client.id,
      service_id: selectedService.id,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      notes: notes
    });

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso! Aguarde a confirmação do estabelecimento."
      });
      setBookingStep(4);
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao criar agendamento",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  const resetBooking = () => {
    setSelectedSalon(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setBookingStep(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ClientHeader 
        client={client} 
        onUpdate={handleClientUpdate} 
        onLogout={handleLogout} 
      />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  bookingStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 4 && bookingStep >= 4 ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    bookingStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-sm text-gray-600">
              {bookingStep === 1 && "Escolha o estabelecimento"}
              {bookingStep === 2 && "Selecione o serviço"}
              {bookingStep === 3 && "Escolha data e horário"}
              {bookingStep === 4 && "Agendamento confirmado"}
            </div>
          </div>
        </div>

        {/* Step 1: Salon Selection */}
        {bookingStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Escolha um Estabelecimento
              </h2>
              <p className="text-gray-600">
                Selecione onde você gostaria de agendar seu serviço
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {salons.filter(salon => salon.is_open).map((salon) => (
                <Card key={salon.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSalonSelect(salon)}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                        <Scissors className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{salon.name}</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Aberto
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{salon.address}</span>
                      </div>
                      {salon.phone && (
                        <div className="flex items-center">
                          <span className="font-medium">Telefone:</span>
                          <span className="ml-2">{salon.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {bookingStep === 2 && selectedSalon && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setBookingStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Serviços - {selectedSalon.name}
                </h2>
                <p className="text-gray-600">Escolha o serviço desejado</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {salonServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleServiceSelect(service)}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600">{service.description}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.duration_minutes} minutos</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {service.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date and Time Selection */}
        {bookingStep === 3 && selectedService && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setBookingStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Agendar - {selectedService.name}
                </h2>
                <p className="text-gray-600">Escolha a data e horário</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div><strong>Estabelecimento:</strong> {selectedSalon?.name}</div>
                    <div><strong>Serviço:</strong> {selectedService.name}</div>
                    <div><strong>Preço:</strong> R$ {selectedService.price.toFixed(2)}</div>
                    <div><strong>Duração:</strong> {selectedService.duration_minutes} minutos</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeSlots().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alguma observação especial..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setBookingStep(2)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleBookingSubmit} 
                    disabled={isSubmitting || !selectedDate || !selectedTime}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {bookingStep === 4 && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="bg-green-50 p-8 rounded-xl">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-800 mb-2">
                Agendamento Realizado!
              </h2>
              <p className="text-green-600">
                Seu agendamento foi enviado com sucesso. Aguarde a confirmação do estabelecimento.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Estabelecimento:</strong></div>
                  <div>{selectedSalon?.name}</div>
                  
                  <div><strong>Serviço:</strong></div>
                  <div>{selectedService?.name}</div>
                  
                  <div><strong>Data:</strong></div>
                  <div>{new Date(selectedDate).toLocaleDateString('pt-BR')}</div>
                  
                  <div><strong>Horário:</strong></div>
                  <div>{selectedTime}</div>
                  
                  <div><strong>Preço:</strong></div>
                  <div className="text-green-600 font-semibold">R$ {selectedService?.price.toFixed(2)}</div>
                </div>
                
                {notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <strong>Observações:</strong>
                    <p className="mt-1">{notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-x-4">
              <Button onClick={resetBooking} variant="outline">
                Fazer Novo Agendamento
              </Button>
              <Button onClick={() => window.location.href = '/client-dashboard'}>
                Ver Meus Agendamentos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBooking;
