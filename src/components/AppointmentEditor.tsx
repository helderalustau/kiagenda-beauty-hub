
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from '@/hooks/useSupabaseData';

interface AppointmentEditorProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: string, notes?: string) => void;
}

const AppointmentEditor = ({ appointment, isOpen, onClose, onUpdate }: AppointmentEditorProps) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>(
    (appointment?.status as 'pending' | 'confirmed' | 'completed' | 'cancelled') || 'pending'
  );
  const [notes, setNotes] = useState(appointment?.notes || '');

  const handleSave = () => {
    if (appointment) {
      onUpdate(appointment.id, status, notes);
      onClose();
    }
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

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium">{appointment.clients?.name}</h4>
            <p className="text-sm text-gray-600">{appointment.services?.name}</p>
            <p className="text-sm text-gray-600">
              {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
            </p>
          </div>
          
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
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentEditor;
