
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
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
  }>;
  clientData: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

const BookingModal = ({ isOpen, onClose, salon, services, clientData }: BookingModalProps) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    const result = await createAppointment({
      salon_id: salon.id,
      client_id: clientData.id,
      service_id: selectedService,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      notes: notes
    });

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Agendamento solicitado! Aguarde a confirmação do salão."
      });
      onClose();
      // Reset form
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao criar agendamento",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agendar Serviço - {salon.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <User className="h-4 w-4" />
              <span><strong>Cliente:</strong> {clientData.name}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="service">Serviço</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2)} ({service.duration_minutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedServiceData && (
            <div className="bg-green-50 p-3 rounded-lg text-sm">
              <div className="text-green-800">
                <div><strong>Serviço:</strong> {selectedServiceData.name}</div>
                <div><strong>Preço:</strong> R$ {selectedServiceData.price.toFixed(2)}</div>
                <div><strong>Duração:</strong> {selectedServiceData.duration_minutes} minutos</div>
              </div>
            </div>
          )}

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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>{isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
