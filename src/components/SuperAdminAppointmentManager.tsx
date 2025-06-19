
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Scissors, RotateCcw, Trash2, Filter } from "lucide-react";
import { Appointment, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface SuperAdminAppointmentManagerProps {
  salonId: string;
  salonName: string;
}

const SuperAdminAppointmentManager = ({ salonId, salonName }: SuperAdminAppointmentManagerProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '`Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      appointment.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Agendamentos - {salonName}
          </h3>
          <p className="text-sm text-gray-600">
            {showDeleted ? 'Visualizando agendamentos deletados' : 'Visualizando agendamentos ativos'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {showDeleted ? 'Ver Ativos' : 'Ver Deletados'}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        {showDeleted ? 'Nenhum agendamento deletado encontrado' : 'Nenhum agendamento encontrado'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className={appointment.deleted_at ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{appointment.client?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Scissors className="h-4 w-4 text-gray-400" />
                          <span>{appointment.service?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{formatTime(appointment.appointment_time)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(appointment.service?.price || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {appointment.deleted_at && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restaurar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja restaurar este agendamento? 
                                  Ele ficará visível novamente para o administrador do estabelecimento.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRestore(appointment.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Restaurar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminAppointmentManager;
