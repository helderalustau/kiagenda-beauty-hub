
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, User, Phone, Mail, MapPin, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { Service, Salon } from '@/hooks/useSupabaseData';
import ServiceCard from './ServiceCard';
import TimeSlotGrid from './TimeSlotGrid';

interface ModernBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const ModernBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: ModernBookingModalProps) => {
  const { services, fetchSalonServices, createAppointment } = useSupabaseData();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (isOpen && salon.id) {
      console.log('Carregando serviços para o modal de agendamento...');
      setLoadingServices(true);
      fetchSalonServices(salon.id).finally(() => {
        setLoadingServices(false);
      });
      resetForm();
    }
  }, [isOpen, salon.id, fetchSalonServices]);

  useEffect(() => {
    if (selectedDate && salon.opening_hours) {
      generateAvailableTimes();
    }
  }, [selectedDate, salon.opening_hours]);

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({ name: '', phone: '', email: '', notes: '' });
    setAvailableTimes([]);
  };

  const generateAvailableTimes = () => {
    if (!selectedDate || !salon.opening_hours) {
      setAvailableTimes([]);
      return;
    }

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const openingHours = salon.opening_hours[dayOfWeek];

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
      if (hour + 0.5 < endTime) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    setAvailableTimes(times);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (date && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (currentStep === 3) {
      setCurrentStep(4);
    }
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

      console.log('Criando agendamento:', appointmentData);
      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso! Você receberá uma confirmação em breve.",
        });
        
        resetForm();
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
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao realizar agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Escolha o Serviço</h3>
            {loadingServices ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando serviços...</p>
              </div>
            ) : services.length > 0 ? (
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelect={handleServiceSelect}
                    isSelected={selectedService?.id === service.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum serviço disponível no momento.</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Selecione a Data</h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <TimeSlotGrid
              availableTimes={availableTimes}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
              selectedDate={selectedDate}
            />
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Seus Dados</h3>
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
                      onChange={(e) => setClientData({...clientData, name: e.target.value})}
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
                      onChange={(e) => setClientData({...clientData, phone: e.target.value})}
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
                    onChange={(e) => setClientData({...clientData, email: e.target.value})}
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
                  onChange={(e) => setClientData({...clientData, notes: e.target.value})}
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

  const BookingSummary = () => {
    if (!selectedService || !selectedDate || !selectedTime) return null;

    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Resumo do Agendamento
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Estabelecimento:</span>
            <span className="font-medium">{salon.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Serviço:</span>
            <span className="font-medium">{selectedService.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span className="font-medium">{format(selectedDate, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span>Horário:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Duração:</span>
            <span className="font-medium">{selectedService.duration_minutes} min</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-base">
            <span>Valor:</span>
            <span className="text-green-700">{formatCurrency(selectedService.price)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">
            Agendar Serviço
          </DialogTitle>
          <DialogDescription className="text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {salon.name} - {salon.address}
          </DialogDescription>
        </DialogHeader>
        
        <StepIndicator />
        
        <div className="space-y-6">
          <StepContent />
          
          {currentStep > 1 && <BookingSummary />}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onClose();
                }
              }}
              className="flex-1"
            >
              {currentStep > 1 ? 'Voltar' : 'Cancelar'}
            </Button>
            
            {currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (currentStep === 1 && !selectedService) return;
                  if (currentStep === 2 && !selectedDate) return;
                  if (currentStep === 3 && !selectedTime) return;
                  setCurrentStep(currentStep + 1);
                }}
                disabled={
                  (currentStep === 1 && !selectedService) ||
                  (currentStep === 2 && !selectedDate) ||
                  (currentStep === 3 && !selectedTime)
                }
                className="flex-1 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                Próximo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernBookingModal;
