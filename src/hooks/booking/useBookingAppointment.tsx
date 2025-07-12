
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Service, Salon } from '@/hooks/useSupabaseData';

interface CreateAppointmentData {
  salon_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  clientName: string;
  clientPhone: string;
  notes?: string;
}

export const useBookingAppointment = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const createAppointmentWithLoggedClient = async (appointmentData: CreateAppointmentData) => {
    try {
      console.log('Creating appointment with logged client data:', appointmentData);

      if (!user?.id) {
        throw new Error('Cliente não está logado');
      }

      // Buscar dados do cliente na tabela client_auth usando o ID do usuário logado
      const { data: clientAuth, error: clientError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('id', user.id)
        .single();

      if (clientError || !clientAuth) {
        throw new Error('Dados do cliente não encontrados');
      }

      console.log('Using client auth data:', clientAuth);

      // Criar agendamento sem user_id
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salon_id,
          service_id: appointmentData.service_id,
          client_auth_id: clientAuth.id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Erro ao criar agendamento');
      }

      console.log('Appointment created successfully:', appointment);
      return { success: true, appointment };

    } catch (error) {
      console.error('Error in createAppointmentWithLoggedClient:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento' 
      };
    }
  };

  const handleSubmit = async (
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: { name: string; phone: string; notes: string },
    salon: Salon,
    setIsSubmitting: (value: boolean) => void
  ) => {
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return { success: false };
    }

    if (!user?.id) {
      toast({
        title: "Erro", 
        description: "Você precisa estar logado para fazer um agendamento",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      console.log('Creating appointment with data:', {
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        client: clientData.name
      });

      // FIX: Usar componentes locais da data para evitar problemas de timezone
      const localYear = selectedDate.getFullYear();
      const localMonth = selectedDate.getMonth() + 1;
      const localDay = selectedDate.getDate();
      const localDateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;

      const appointmentResult = await createAppointmentWithLoggedClient({
        salon_id: salon.id,
        service_id: selectedService.id,
        appointment_date: localDateString,
        appointment_time: selectedTime,
        clientName: clientData.name,
        clientPhone: clientData.phone,
        notes: clientData.notes || undefined
      });

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || 'Erro ao criar solicitação de agendamento');
      }

      toast({
        title: "Solicitação Enviada!",
        description: "Sua solicitação de agendamento foi enviada para o estabelecimento. Você receberá uma resposta em breve.",
      });

      return { success: true };

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar solicitação de agendamento",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
