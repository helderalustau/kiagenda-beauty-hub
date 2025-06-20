
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Phone, Mail, ArrowLeft, ArrowRight, Scissors, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSupabaseData, Service, Salon } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import ServiceCard from './ServiceCard';
import TimeSlotGrid from './TimeSlotGrid';

interface ModernBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const ModernBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: ModernBookingModalProps) => {
  const { fetchSalonServices, createAppointment } = useSupabaseData();
  const { toast } = useToast();
  
  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load services when modal opens
  useEffect(() => {
    if (isOpen && salon?.id) {
      loadSalonServices();
    }
  }, [isOpen, salon?.id]);

  // Generate available times when date is selected
  useEffect(() => {
    if (selectedDate && salon?.opening_hours) {
      generateAvailableTimes();
    }
  }, [selectedDate, salon?.opening_hours]);

  const loadSalonServices = async () => {
    try {
      setLoadingServices(true);
      console.log('ModernBookingModal - Loading services for salon:', salon.id);
      
      const fetchedServices = await fetchSalonServices(salon.id);
      console.log('ModernBookingModal - Services loaded:', fetchedServices.length);
      
      setServices(fetchedServices);
      
      if (fetchedServices.length === 0) {
        toast({
          title: "Aviso",
          description: "Este estabelecimento ainda não possui serviços cadastrados.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('ModernBookingModal - Error loading services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const generateAvailableTimes = () => {
    if (!selectedDate || !salon.opening_hours) {
      setAvailableTimes([]);
      return;
    }

    const dayOfWeek = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const openingHours = salon.opening_hours[dayOfWeek.toLowerCase()];

    if (!openingHours || openingHours.closed) {
      setAvailableTimes([]);
      return;
    }

    const { open, close } = openingHours;
    const startTime = parseInt(open.split(':')[0]);
    const endTime = parseInt(close.split(':')[0]);
    const times: string[] = [];

    for (let hour = startTime; hour < endTime; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    setAvailableTimes(times);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        salon_id: salon.id,
        service_id: selectedService.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        notes: clientData.notes,
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientEmail: clientData.email
      };

      console.log('ModernBookingModal - Creating appointment:', appointmentData);

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso! Você receberá uma confirmação em breve.",
        });
        
        // Reset form
        handleReset();
        onBookingSuccess();
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao realizar agendamento. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("ModernBookingModal - Error creating appointment:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao realizar agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({ name: '', phone: '', email: '', notes: '' });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setSelectedService(null);
      } else if (currentStep === 3) {
        setSelectedDate(undefined);
        setSelectedTime('');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Escolha um Serviço</h3>
              <p className="text-gray-600">Selecione o serviço que deseja agendar</p>
            </div>
            
            {loadingServices ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando serviços...</p>
              </div>
            ) : services.length > 0 ? (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelect={handleServiceSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço disponível</h3>
                <p className="text-gray-600">Este estabelecimento ainda não possui serviços cadastrados.</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Escolha Data e Horário</h3>
              <p className="text-gray-600">Selecione quando deseja ser atendido</p>
            </div>

            {selectedService && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">{selectedService.name}</h4>
                      <p className="text-sm text-blue-700">
                        {selectedService.duration_minutes} min • {formatCurrency(selectedService.price)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Horário</Label>
                {selectedDate ? (
                  <TimeSlotGrid
                    availableTimes={availableTimes}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Selecione uma data primeiro</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seus Dados</h3>
              <p className="text-gray-600">Preencha seus dados para confirmar o agendamento</p>
            </div>

            {/* Resumo do agendamento */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{salon.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Scissors className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedService?.name} - {formatCurrency(selectedService?.price || 0)}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={clientData.name}
                      onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clientPhone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="clientEmail">Email (opcional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={clientData.email}
                    onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação adicional?"
                  value={clientData.notes}
                  onChange={(e) => setClientData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Agendar Serviço
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              {salon.name} - {salon.address}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep >= step 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={cn(
                      "w-12 h-0.5 mx-2",
                      currentStep > step ? "bg-blue-600" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancelar' : 'Voltar'}
            </Button>

            {currentStep === 3 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center"
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                disabled={
                  (currentStep === 1 && !selectedService) ||
                  (currentStep === 2 && (!selectedDate || !selectedTime))
                }
                onClick={() => currentStep === 2 && selectedDate && selectedTime ? setCurrentStep(3) : undefined}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernBookingModal;
