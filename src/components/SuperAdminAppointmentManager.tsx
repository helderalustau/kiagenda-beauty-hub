
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAppointmentManager } from '@/hooks/useAppointmentManager';
import AppointmentFilters from './appointment-manager/AppointmentFilters';
import AppointmentsTable from './appointment-manager/AppointmentsTable';

interface SuperAdminAppointmentManagerProps {
  salonId: string;
  salonName: string;
}

const SuperAdminAppointmentManager = ({ salonId, salonName }: SuperAdminAppointmentManagerProps) => {
  const {
    appointments,
    loading,
    showDeleted,
    setShowDeleted,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    handleRestore
  } = useAppointmentManager(salonId);

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

      <AppointmentFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <AppointmentsTable 
        appointments={appointments}
        showDeleted={showDeleted}
        onRestore={handleRestore}
      />
    </div>
  );
};

export default SuperAdminAppointmentManager;
