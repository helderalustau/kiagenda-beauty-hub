
import { useState, useEffect } from 'react';
import { Appointment, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

export const useAppointmentManager = (salonId: string) => {
  const { fetchAllAppointments, restoreAppointment } = useSupabaseData();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [salonId, showDeleted]);

  const loadAppointments = async () => {
    setLoading(true);
    const result = await fetchAllAppointments(salonId, showDeleted);
    if (result.success) {
      setAppointments(result.data || []);
    }
    setLoading(false);
  };

  const handleRestore = async (appointmentId: string) => {
    const result = await restoreAppointment(appointmentId);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Agendamento restaurado com sucesso!"
      });
      loadAppointments();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      appointment.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return {
    appointments: filteredAppointments,
    loading,
    showDeleted,
    setShowDeleted,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    handleRestore
  };
};
