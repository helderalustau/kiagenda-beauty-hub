import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

const ClientBooking = () => {
  const { 
    salons, 
    services, 
    loading, 
    fetchAllSalons, 
    fetchSalonServices, 
    createAppointment 
  } = useSupabaseData();
  const { toast } = useToast();
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllSalons();
  }, [fetchAllSalons]);

  useEffect(() => {
    if (selectedSalon) {
      fetchSalonServices(selectedSalon);
    }
  }, [selectedSalon, fetchSalonServices]);

  const handleSalonChange = (salonId: string) => {
    setSelectedSalon(salonId);
    setSelectedService('');
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    setTime('');
    setAvailableTimes(generateAvailableTimes(date));
  };

  const generateAvailableTimes = (date: Date | undefined): string[] => {
    if (!date || !selectedSalon) return [];

    // Get salon opening hours
    const selectedSalonData = salons.find(salon => salon.id === selectedSalon);
    if (!selectedSalonData || !selectedSalonData.opening_hours) return [];

    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const openingHours = selectedSalonData.opening_hours[dayOfWeek.toLowerCase()];

    if (!openingHours || openingHours.closed) return [];

    const { open, close } = openingHours;
    const startTime = parseInt(open.split(':')[0]);
    const endTime = parseInt(close.split(':')[0]);
    const times: string[] = [];

    for (let hour = startTime; hour < endTime; hour++) {
      times.push(`${hour}:00`);
      times.push(`${hour}:30`);
    }

    return times;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedSalon || !selectedService || !date || !time || !clientName || !clientPhone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentDate = format(date, 'yyyy-MM-dd');
      const appointmentData = {
        salon_id: selectedSalon,
        service_id: selectedService,
        appointment_date: appointmentDate,
        appointment_time: time,
        notes: notes,
        clientName: clientName,
        clientPhone: clientPhone,
        clientEmail: clientEmail
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso!"
        });

        setSelectedSalon('');
        setSelectedService('');
        setDate(undefined);
        setTime('');
        setNotes('');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao criar agendamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar agendamento",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Agendar um Serviço</h2>
          <p className="text-gray-600 mt-2">Selecione o estabelecimento, serviço e data desejada para agendar seu horário.</p>
        </div>

        <Separator />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Informações do Agendamento</CardTitle>
            <CardDescription>Preencha os dados abaixo para realizar o agendamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <Label htmlFor="salon">Estabelecimento</Label>
                <Select onValueChange={handleSalonChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um estabelecimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons.map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>{salon.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service">Serviço</Label>
                <Select onValueChange={handleServiceChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Horário</Label>
                <Select onValueChange={setTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="clientName">Nome</Label>
                <Input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input
                  type="tel"
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Seu telefone"
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">Email (opcional)</Label>
                <Input
                  type="email"
                  id="clientEmail"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Seu email"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observação adicional?"
                />
              </div>

              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Agendando..." : "Agendar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientBooking;
