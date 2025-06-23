
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, DollarSign, Calendar as CalendarIcon, User, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Salon } from '@/hooks/useSupabaseData';
import { useSimpleBooking } from '@/hooks/useSimpleBooking';
import ServiceCard from './ServiceCard';

interface SimpleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const SimpleBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: SimpleBookingModalProps) => {
  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    bookingData,
    services,
    availableTimes,
    isSubmitting,
    loadingServices,
    loadingTimes,
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setBookingData,
    loadServices,
    loadAvailableTimes,
    submitBooking,
    resetBooking,
    formatCurrency
  } = useSimpleBooking(salon);

  // Carregar serviços quando o modal abre
  useEffect(() => {
    if (isOpen && salon?.id) {
      console.log('Modal opened, loading services for salon:', salon.name);
      loadServices();
    }
  }, [isOpen, salon?.id, loadServices]);

  // Carregar horários quando data é selecionada - com debounce para evitar loops
  useEffect(() => {
    if (selectedDate && !loadingTimes) {
      console.log('Date selected, loading times:', selectedDate.toDateString());
      const timeoutId = setTimeout(() => {
        loadAvailableTimes(selectedDate);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate, loadAvailableTimes, loadingTimes]);

  const handleClose = () => {
    console.log('Closing modal and resetting state');
    resetBooking();
    onClose();
  };

  const handleSubmit = async () => {
    console.log('Submitting booking');
    const success = await submitBooking();
    if (success) {
      onBookingSuccess();
      onClose();
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,5})/, '($1) $2')
        .replace(/(\d{2})/, '($1');
    }
    return value;
  };

  const handleTimeSelect = (time: string) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
  };

  if (!salon?.is_open) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Estabelecimento Fechado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600">Este estabelecimento não está aceitando agendamentos no momento.</p>
            <Button onClick={handleClose} className="mt-4">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 -m-6 mb-6">
          <DialogTitle className="text-xl font-bold flex items-center">
            {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
            Agendar Serviço - {salon.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicador de progresso */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          {/* Etapa 1: Selecionar Serviço */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Escolha um Serviço</h3>
                <p className="text-gray-600">Selecione o serviço desejado</p>
              </div>

              {loadingServices ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Carregando serviços...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nenhum serviço disponível</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={setSelectedService}
                      isSelected={selectedService?.id === service.id}
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
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

          {/* Etapa 2: Selecionar Data e Horário */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Badge variant="outline">Passo 2 de 3</Badge>
              </div>

              {selectedService && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-900">Serviço Selecionado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-blue-900">{selectedService.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-green-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-semibold">{formatCurrency(selectedService.price)}</span>
                          </div>
                          <div className="flex items-center text-blue-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{selectedService.duration_minutes} min</span>
                          </div>
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
                      onSelect={(date) => {
                        console.log('Calendar date selected:', date?.toDateString());
                        setSelectedDate(date);
                        setSelectedTime(''); // Limpar horário selecionado quando data muda
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      locale={ptBR}
                      className="rounded-md border w-full"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Escolha o Horário
                      {loadingTimes && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedDate ? (
                      <p className="text-gray-500 text-center py-8">
                        Selecione uma data primeiro
                      </p>
                    ) : loadingTimes ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="text-sm text-gray-600 mt-2">Carregando horários...</p>
                      </div>
                    ) : availableTimes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhum horário disponível para esta data
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSelect(time)}
                            className="text-sm"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedDate && selectedTime && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <h4 className="font-semibold text-green-900 mb-2">Resumo</h4>
                      <p className="text-green-800">
                        <strong>Data:</strong> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-green-800">
                        <strong>Horário:</strong> {selectedTime}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  disabled={!selectedDate || !selectedTime || loadingTimes}
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Dados do Cliente */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Badge variant="outline">Passo 3 de 3</Badge>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold">Seus Dados</h3>
                <p className="text-gray-600">Confirme seus dados para finalizar</p>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Resumo do Agendamento</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Serviço:</strong> {selectedService?.name} - {formatCurrency(selectedService?.price || 0)}</p>
                    <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd/MM/yyyy")}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={bookingData.name}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: formatPhoneNumber(e.target.value) })}
                      className="pl-10"
                      required
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação adicional?"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !bookingData.name || !bookingData.phone}
                  className="flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Finalizar Agendamento'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBookingModal;
