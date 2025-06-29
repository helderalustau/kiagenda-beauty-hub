
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, Clock, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Salon, Service } from '@/hooks/useSupabaseData';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';

interface SimplifiedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const SimplifiedBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: SimplifiedBookingModalProps) => {
  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    clientData,
    isSubmitting,
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setClientData,
    submitBookingRequest,
    resetBooking
  } = useBookingFlow(salon?.id);

  const { services, loadingServices } = useBookingServices(salon?.id);
  const { availableSlots, loading: loadingTimes } = useAvailableTimeSlots(
    salon?.id, 
    selectedDate,
    selectedService?.id
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetBooking();
    onClose();
  };

  const handleSubmit = async () => {
    const success = await submitBookingRequest();
    if (success) {
      onBookingSuccess();
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!salon?.is_open) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Estabelecimento Fechado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600">Este estabelecimento não está aceitando agendamentos no momento.</p>
            <Button onClick={handleClose} className="mt-4">Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Agendar Serviço - {salon?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Escolha o Serviço</h3>
              
              {loadingServices ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando serviços...</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        selectedService?.id === service.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-green-600">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span className="font-semibold">{formatCurrency(service.price)}</span>
                              </div>
                              <div className="flex items-center text-blue-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{service.duration_minutes} min</span>
                              </div>
                            </div>
                          </div>
                          {selectedService?.id === service.id && (
                            <Badge className="bg-blue-600">Selecionado</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  disabled={!selectedService}
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Date and Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <h3 className="text-lg font-semibold">Data e Horário</h3>
                <div></div>
              </div>

              {selectedService && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-blue-900">{selectedService.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-green-600 font-semibold">{formatCurrency(selectedService.price)}</span>
                          <span className="text-blue-600">{selectedService.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Escolha a Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < today}
                      locale={ptBR}
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Escolha o Horário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedDate ? (
                      <div className="text-center py-8 text-gray-500">
                        Selecione uma data primeiro
                      </div>
                    ) : loadingTimes ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Carregando horários...</p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum horário disponível para esta data
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className="h-10"
                          >
                            {time.substring(0, 5)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Client Data */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <h3 className="text-lg font-semibold">Seus Dados</h3>
                <div></div>
              </div>

              {/* Resumo do agendamento */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Resumo do Agendamento</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Serviço:</strong> {selectedService?.name}</p>
                    <p><strong>Data:</strong> {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Valor:</strong> {selectedService ? formatCurrency(selectedService.price) : ''}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    placeholder="seu@email.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={clientData.notes}
                    onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                    placeholder="Alguma observação especial..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !clientData.name.trim() || !clientData.phone.trim()}
                  className="bg-green-600 hover:bg-green-700 px-8"
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Agendamento'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedBookingModal;
