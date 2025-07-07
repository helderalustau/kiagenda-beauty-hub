
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { usePhoneFormatter } from "@/hooks/usePhoneFormatter";
import { formatCep } from "@/utils/cepFormatter";
import { Service, Salon } from '@/hooks/useSupabaseData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const BookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: BookingModalProps) => {
  const { services, fetchSalonServices, createAppointment } = useSupabaseData();
  const { toast } = useToast();
  const { formatPhoneNumber } = usePhoneFormatter();
  
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCep, setClientCep] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && salon.id) {
      fetchSalonServices(salon.id);
    }
  }, [isOpen, salon.id, fetchSalonServices]);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate]);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientPhone(formatted);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setClientCep(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) {
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
        service_id: selectedService,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        notes: notes,
        clientName: clientName,
        clientPhone: clientPhone,
        clientEmail: clientEmail
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso! Você receberá uma confirmação em breve.",
        });
        
        // Reset form
        setSelectedService('');
        setSelectedDate(undefined);
        setSelectedTime('');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setClientCep('');
        setClientPassword('');
        setNotes('');
        
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

  const selectedServiceData = useMemo(() => 
    services.find(service => service.id === selectedService), 
    [services, selectedService]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Novo Agendamento
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {salon.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Serviço */}
          <div>
            <Label htmlFor="service" className="text-sm font-medium">Serviço *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-sm text-gray-500 ml-4">
                        {formatCurrency(service.price)} • {service.duration_minutes}min
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Data do Agendamento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium">Horário *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Dados do Cliente</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="clientName" className="text-sm">Nome Completo *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientName"
                    type="text"
                    placeholder="Nome completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientPhone" className="text-sm">Telefone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientPhone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    maxLength={15}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="clientEmail" className="text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientCep" className="text-sm">CEP</Label>
                <Input
                  id="clientCep"
                  type="text"
                  placeholder="99999-999"
                  value={clientCep}
                  onChange={handleCepChange}
                  className="mt-1"
                  maxLength={9}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientPassword" className="text-sm">Senha para acesso</Label>
              <PasswordInput
                id="clientPassword"
                placeholder="Digite uma senha"
                value={clientPassword}
                onChange={(e) => setClientPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-sm">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o agendamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Resumo do Agendamento */}
          {selectedServiceData && selectedDate && selectedTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 text-center">Resumo do Agendamento</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Serviço:</span>
                  <span className="font-medium text-blue-900">{selectedServiceData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Data agendada:</span>
                  <span className="font-medium text-blue-900">
                    {format(selectedDate, "dd/MM/yyyy - EEEE", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Horário:</span>
                  <span className="font-medium text-blue-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Duração:</span>
                  <span className="font-medium text-blue-900">{selectedServiceData.duration_minutes} min</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700 font-medium">Valor:</span>
                  <span className="font-bold text-blue-900">{formatCurrency(selectedServiceData.price)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
