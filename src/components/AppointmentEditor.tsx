
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Appointment, Service, Client, useSupabaseData } from '@/hooks/useSupabaseData';

interface AppointmentEditorProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: string, notes?: string) => void;
  mode?: 'edit' | 'create';
  clients?: Client[];
  services?: Service[];
  salonId?: string;
}

const AppointmentEditor = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onUpdate, 
  mode = 'edit',
  clients = [],
  services = [],
  salonId = ''
}: AppointmentEditorProps) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>(
    (appointment?.status as 'pending' | 'confirmed' | 'completed' | 'cancelled') || 'pending'
  );
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [appointmentData, setAppointmentData] = useState({
    client_id: appointment?.client_id || '',
    service_id: appointment?.service_id || '',
    appointment_date: appointment?.appointment_date || '',
    appointment_time: appointment?.appointment_time || ''
  });

  const { createAppointment } = useSupabaseData();

  useEffect(() => {
    if (appointment) {
      setStatus((appointment.status as 'pending' | 'confirmed' | 'completed' | 'cancelled') || 'pending');
      setNotes(appointment.notes || '');
      setAppointmentData({
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time
      });
    }
  }, [appointment]);

  const handleSave = async () => {
    if (mode === 'edit' && appointment) {
      onUpdate(appointment.id, status, notes);
    } else if (mode === 'create') {
      const result = await createAppointment({
        salon_id: salonId,
        client_id: appointmentData.client_id,
        service_id: appointmentData.service_id,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        notes
      });
      
      if (result.success) {
        onClose();
      }
    }
    onClose();
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as 'pending' | 'confirmed' | 'completed' | 'cancelled');
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
    { value: 'confirmed', label: 'Confirmado', color: 'text-blue-600' },
    { value: 'completed', label: 'Concluído', color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelado', color: 'text-red-600' }
  ];

  const selectedClient = clients.find(c => c.id === appointmentData.client_id);
  const selectedService = services.find(s => s.id === appointmentData.service_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {mode === 'edit' && appointment ? (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium">{appointment.client?.name}</h4>
              <p className="text-sm text-gray-600">{appointment.service?.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select 
                  value={appointmentData.client_id} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, client_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Serviço</Label>
                <Select 
                  value={appointmentData.service_id} 
                  onValueChange={(value) => setAppointmentData({...appointmentData, service_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={appointmentData.appointment_date}
                    onChange={(e) => setAppointmentData({...appointmentData, appointment_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={appointmentData.appointment_time}
                    onChange={(e) => setAppointmentData({...appointmentData, appointment_time: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {mode === 'edit' ? 'Salvar' : 'Criar Agendamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentEditor;
