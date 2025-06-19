
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, Plus, LogOut, Settings, UserPlus, CheckCheck, ListChecks, BarChart3, Bell, ChevronsUpDown, Users, Calendar } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SuperAdminHeader from '@/components/SuperAdminHeader';

const AdminDashboard = () => {
  const { salon, appointments, services, adminUsers, updateAppointmentStatus, updateSalon, updateAdminUser, deleteAdminUser, registerAdmin, createAppointment, refreshData, fetchSalonDetails } = useSupabaseData();
  const { toast } = useToast();
  const [adminData, setAdminData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddAttendant, setShowAddAttendant] = useState(false);
  const [newAttendant, setNewAttendant] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'collaborator' as 'admin' | 'manager' | 'collaborator'
  });
  const [appointmentStatus, setAppointmentStatus] = useState<{ [key: string]: string }>({});
  const [appointmentNotes, setAppointmentNotes] = useState<{ [key: string]: string }>({});
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [clients, setClients] = useState([
    { id: '1', name: 'João', phone: '1234-5678', email: 'joao@email.com' },
    { id: '2', name: 'Maria', phone: '9876-5432', email: 'maria@email.com' },
    { id: '3', name: 'Carlos', phone: '5555-1212', email: 'carlos@email.com' }
  ]);
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [salonDetails, setSalonDetails] = useState<{
    salon: any;
    totalClients: number;
    monthlyRevenue: number;
  } | null>(null);

  const isSuperAdmin = adminData?.role === 'super_admin';
  const currentSalonId = localStorage.getItem('selectedSalonId');

  useEffect(() => {
    const storedData = localStorage.getItem('adminData');
    if (storedData) {
      setAdminData(JSON.parse(storedData));
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (isSuperAdmin && currentSalonId) {
        // Super admin gerenciando um salão específico
        const details = await fetchSalonDetails(currentSalonId);
        setSalonDetails(details);
        refreshData(currentSalonId);
      } else if (adminData?.salon_id) {
        // Admin normal do próprio salão
        refreshData(adminData.salon_id);
      }
    };

    loadData();
  }, [adminData, currentSalonId]);

  const handleBackToSuperAdmin = () => {
    localStorage.removeItem('selectedSalonId');
    window.location.href = '/super-admin-dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  const handleSettingsSubmit = async (e: any) => {
    e.preventDefault();

    if (!salon) return;

    const result = await updateSalon({
      id: salon.id,
      notification_sound: (e.target.notification_sound.value || 'default'),
      max_attendants: parseInt(e.target.max_attendants.value)
    });

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
      setShowSettings(false);
      refreshData(salon.id);
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleAddAttendant = async () => {
    if (!salon) return;

    const result = await registerAdmin(
      salon.id,
      newAttendant.name,
      newAttendant.password,
      newAttendant.email,
      newAttendant.phone,
      newAttendant.role
    );

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Atendente adicionado com sucesso!"
      });
      setShowAddAttendant(false);
      setNewAttendant({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'collaborator'
      });
      refreshData(salon.id);
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleAppointmentStatusChange = async (appointmentId: string, status: string) => {
    setAppointmentStatus(prevState => ({
      ...prevState,
      [appointmentId]: status
    }));

    await updateAppointmentStatus(appointmentId, status, appointmentNotes[appointmentId]);
  };

  const handleAppointmentNotesChange = (appointmentId: string, notes: string) => {
    setAppointmentNotes(prevState => ({
      ...prevState,
      [appointmentId]: notes
    }));
  };

  const handleSaveAppointmentNotes = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, appointmentStatus[appointmentId], appointmentNotes[appointmentId]);
    toast({
      title: "Sucesso",
      description: "Notas do agendamento salvas com sucesso!"
    });
  };

  const handleDeleteAttendant = async (userId: string) => {
    const result = await deleteAdminUser(userId);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Atendente excluído com sucesso!"
      });
      refreshData(salon?.id || '');
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateAppointment = async () => {
    if (!salon) return;

    const result = await createAppointment({
      salon_id: salon.id,
      client_id: newAppointment.client_id,
      service_id: newAppointment.service_id,
      appointment_date: newAppointment.appointment_date,
      appointment_time: newAppointment.appointment_time,
      notes: newAppointment.notes
    });

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!"
      });
      setShowNewAppointmentDialog(false);
      setNewAppointment({
        client_id: '',
        service_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
      refreshData(salon.id);
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Super Admin Header - aparece quando super admin está gerenciando um salão */}
      {isSuperAdmin && currentSalonId && salonDetails && (
        <SuperAdminHeader
          salon={salonDetails.salon}
          totalClients={salonDetails.totalClients}
          monthlyRevenue={salonDetails.monthlyRevenue}
          onBack={handleBackToSuperAdmin}
        />
      )}

      {/* Header normal - aparece para admins normais ou quando super admin não está gerenciando salão específico */}
      {(!isSuperAdmin || !currentSalonId) && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                    {salon?.name || 'Admin Dashboard'}
                  </h1>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Equipe</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <ListChecks className="h-4 w-4" />
              <span>Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Agendamentos</h2>
              <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Agendamento</DialogTitle>
                    <DialogDescription>
                      Selecione o cliente, serviço, data e horário do agendamento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client">Cliente</Label>
                      <Select onValueChange={(value) => setNewAppointment({...newAppointment, client_id: value})}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service">Serviço</Label>
                      <Select onValueChange={(value) => setNewAppointment({...newAppointment, service_id: value})}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services?.map(service => (
                            <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Label>Data do Agendamento</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center" side="bottom">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="appointment-time">Horário</Label>
                      <Input
                        type="time"
                        id="appointment-time"
                        value={newAppointment.appointment_time}
                        onChange={(e) => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        placeholder="Alguma observação?"
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateAppointment}>
                      Criar Agendamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.clients?.name}</TableCell>
                      <TableCell>{appointment.services?.name}</TableCell>
                      <TableCell>
                        {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} - {appointment.appointment_time}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={appointmentStatus[appointment.id] || appointment.status}
                          onValueChange={(value) => handleAppointmentStatusChange(appointment.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Ver Notas
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <Label htmlFor="notes">Anotações do Agendamento</Label>
                                <Input
                                  id="notes"
                                  placeholder="Anotações..."
                                  value={appointmentNotes[appointment.id] || appointment.notes || ''}
                                  onChange={(e) => handleAppointmentNotesChange(appointment.id, e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSaveAppointmentNotes(appointment.id)}>Salvar Notas</Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Equipe</h2>
              <Button onClick={() => setShowAddAttendant(true)} className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Atendente
              </Button>
            </div>

            <Dialog open={showAddAttendant} onOpenChange={setShowAddAttendant}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Atendente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo atendente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="attendant-name">Nome</Label>
                    <Input
                      id="attendant-name"
                      value={newAttendant.name}
                      onChange={(e) => setNewAttendant({...newAttendant, name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendant-email">Email</Label>
                    <Input
                      id="attendant-email"
                      type="email"
                      value={newAttendant.email}
                      onChange={(e) => setNewAttendant({...newAttendant, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendant-phone">Telefone</Label>
                    <Input
                      id="attendant-phone"
                      value={newAttendant.phone}
                      onChange={(e) => setNewAttendant({...newAttendant, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendant-password">Senha</Label>
                    <Input
                      id="attendant-password"
                      type="password"
                      value={newAttendant.password}
                      onChange={(e) => setNewAttendant({...newAttendant, password: e.target.value})}
                      placeholder="Senha"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendant-role">Função</Label>
                    <Select onValueChange={(value) => setNewAttendant({...newAttendant, role: value as 'admin' | 'manager' | 'collaborator'})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="collaborator">Colaborador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAddAttendant(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddAttendant}>
                    Adicionar Atendente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteAttendant(user.id)}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div>
              lista de serviços
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-bold">Configurações do Salão</h2>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Salão</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu salão.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="notification_sound">Som de Notificação</Label>
                    <Input id="notification_sound" defaultValue={salon?.notification_sound || 'default'} placeholder="URL do som de notificação" />
                  </div>
                  <div>
                    <Label htmlFor="max_attendants">Número Máximo de Atendentes</Label>
                    <Input
                      id="max_attendants"
                      type="number"
                      defaultValue={salon?.max_attendants || 5}
                      placeholder="Número máximo de atendentes"
                    />
                  </div>
                  <Button type="submit">Salvar Alterações</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
