
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, User, Phone, Mail, MapPin, Scissors, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import { useAuth } from '@/hooks/useAuth';
import { Salon, Service } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

interface ModernBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  services: Service[];
  onBookingSuccess: () => void;
}

const ModernBookingModal = ({ isOpen, onClose, salon, services, onBookingSuccess }: ModernBookingModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [clientInfo, setClientInfo] = useState<any>(null);

  const { availableSlots, loading: loadingSlots } = useAvailableTimeSlots(
    salon?.id,
    selectedDate,
    selectedService?.id
  );

  const { isSubmitting, submitBooking } = useBookingSubmission(salon?.id);

  // Carregar dados do cliente logado
  useEffect(() => {
    const loadClientData = async () => {
      if (!user?.id || !isOpen) return;

      try {
        const { data: client, error } = await supabase
          .from('client_auth')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && client) {
          setClientInfo(client);
          setClientData({
            name: client.name || client.username || '',
            phone: client.phone || '',
            email: client.email || '',
            notes: ''
          });
        }
      } catch (error) {
        console.error('Error loading client data:', error);
      }
    };

    loadClientData();
  }, [user?.id, isOpen]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmit = async () => {
    const success = await submitBooking(selectedService, selectedDate, selectedTime, clientData);
    
    if (success) {
      onBookingSuccess();
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData(prev => ({ ...prev, notes: '' }));
    onClose();
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1: return selectedService !== null;
      case 2: return selectedDate !== undefined && selectedTime !== '';
      case 3: return clientData.name.trim() !== '' && clientData.phone.trim() !== '';
      default: return false;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!salon) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>{salon.name}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-8 h-0.5 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Escolha o Serviço</h3>
            <div className="grid gap-3">
              {services.filter(s => s.active).map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService?.id === service.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(service.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && selectedService && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Data e Horário</h3>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Voltar
              </Button>
            </div>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Scissors className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{selectedService.name}</span>
                <Badge variant="outline">{formatCurrency(selectedService.price)}</Badge>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Escolha a Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date < new Date(Date.now() - 86400000)}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Horários Disponíveis - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </Label>
                  
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Carregando horários...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>Nenhum horário disponível para esta data</p>
                        </div>
                      ) : (
                        availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSelect(time)}
                            className="h-10"
                          >
                            {time}
                          </Button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Client Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Confirme seus Dados</h3>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                Voltar
              </Button>
            </div>

            {/* Booking Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Resumo do Agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Serviço:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração:</span>
                    <span className="font-medium">{selectedService?.duration_minutes} minutos</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Valor:</span>
                    <span className="text-blue-600">{selectedService && formatCurrency(selectedService.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Data Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Usuário *</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <Input
                      id="name"
                      value={clientData.name}
                      onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(00)00000-0000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={clientData.notes}
                  onChange={(e) => setClientData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Alguma observação especial para o atendimento?"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!canProceedToNextStep() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar Agendamento'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModernBookingModal;
