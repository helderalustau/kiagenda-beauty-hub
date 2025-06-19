
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Appointment } from '@/hooks/useSupabaseData';
import AppointmentTableRow from './AppointmentTableRow';

interface AppointmentsTableProps {
  appointments: Appointment[];
  showDeleted: boolean;
  onRestore: (appointmentId: string) => void;
}

const AppointmentsTable = ({ appointments, showDeleted, onRestore }: AppointmentsTableProps) => {
  return (
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
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      {showDeleted ? 'Nenhum agendamento deletado encontrado' : 'Nenhum agendamento encontrado'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <AppointmentTableRow 
                    key={appointment.id} 
                    appointment={appointment} 
                    onRestore={onRestore}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsTable;
