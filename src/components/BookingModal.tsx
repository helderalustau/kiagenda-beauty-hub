
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: {
    id: string;
    name: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
    description?: string;
  }>;
  clientData: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onBookingComplete?: () => void;
}

const BookingModal = ({ isOpen, onClose, salon, services, clientData, onBookingComplete }: BookingModalProps) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { createAppointment } = useSupabaseData();
  const { toast } = useToast();

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

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    console.log('Enviando agendamento:', {
      salon_id: salon.id,
      client_id: clientData.id,
      service_id: selectedService,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      notes: notes
    });

    const result = await createAppointment({
      salon_id: salon.id,
      client_id: clientData.id,
      service_id: selectedService,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      notes: notes
    });

    if (result.success) {
      setIsSuccess(true);
      toast({
        title: "Sucesso!",
        description: "Sua solicitação de agendamento foi enviada. Aguarde a confirmação do estabelecimento."
      });
      
      // Após 2 segundos, chamar callback e fechar modal
      setTimeout(() => {
        if (onBookingComplete) {
          onBookingComplete();
        }
        handleClose();
      }, 2000);
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao criar agendamento",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setIsSuccess(false);
    onClose();
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  // Tela de sucesso
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Solicitação Enviada!
            </h2>
            <p className="text-gray-600 mb-4">
              Seu agendamento foi solicitado com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              O estabelecimento receberá sua solicitação e entrará em contato para confirmar.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agendar Serviço - {salon.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <User className="h-4 w-4" />
              <span><strong>Cliente:</strong> {clientData.name}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="service">Serviço *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-gray-500">
                        R$ {service.price.toFixed(2)} - {service.duration_minutes} min
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedServiceData && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Detalhes do Serviço</h4>
              <div className="text-sm text-green-700 space-y-1">
                <div><strong>Serviço:</strong> {selectedServiceData.name}</div>
                <div><strong>Preço:</strong> R$ {selectedServiceData.price.toFixed(2)}</div>
                <div><strong>Duração:</strong> {selectedServiceData.duration_minutes} minutos</div>
                {selectedServiceData.description && (
                  <div><strong>Descrição:</strong> {selectedServiceData.description}</div>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="time">Horário *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((time) => (
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

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação especial para o estabelecimento..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !selectedService || !selectedDate || !selectedTime}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Solicitar Agendamento'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
