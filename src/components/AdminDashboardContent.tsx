
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Appointment, Service } from '@/hooks/useSupabaseData';
import { Salon } from '@/types/supabase-entities';
import AdminCalendarView from './admin/AdminCalendarView';
import FinancialDashboard from './admin/FinancialDashboard';
import ServiceManager from './ServiceManager';
import AdminAppointmentsSummary from './AdminAppointmentsSummary';
import CleanDashboardOverview from './admin/CleanDashboardOverview';
import AdminSettingsPanel from './settings/AdminSettingsPanel';
import { useAppointmentData } from '@/hooks/useAppointmentData';

interface AdminDashboardContentProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: any[];
  onRefresh: () => Promise<void>;
}

const AdminDashboardContent = ({ 
  appointments, 
  services, 
  salon,
  adminUsers,
  onRefresh 
}: AdminDashboardContentProps) => {
  const { updateAppointmentStatus } = useAppointmentData();

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      console.log('🔄 Updating appointment status:', { id, status });
      const result = await updateAppointmentStatus(id, status as any);
      if (result.success) {
        console.log('✅ Status updated successfully');
        await onRefresh();
      } else {
        console.error('❌ Failed to update status:', result.message);
      }
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
    }
  };

  return (
    <div className="space-y-2">
      <TabsContent value="overview" className="space-y-2 mt-2">
        <CleanDashboardOverview 
          appointments={appointments}
          services={services}
          salon={salon}
          adminUsers={adminUsers}
          onUpdateStatus={onRefresh}
        />
      </TabsContent>

      <TabsContent value="agenda" className="space-y-2 mt-2">
        {/* Resumo dos Agendamentos de Hoje */}
        <AdminAppointmentsSummary
          appointments={appointments}
          selectedDate={new Date()}
          loading={false}
          showFutureOnly={false}
          onUpdateStatus={handleUpdateStatus}
        />
        
        {/* Próximos Agendamentos */}
        <AdminAppointmentsSummary
          appointments={appointments}
          selectedDate={new Date()}
          loading={false}
          showFutureOnly={true}
          onUpdateStatus={handleUpdateStatus}
        />
        
        {/* Agenda Principal - Calendário Semanal */}
        <AdminCalendarView 
          salonId={salon.id}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="financial" className="space-y-2 mt-2">
        <FinancialDashboard appointments={appointments} />
      </TabsContent>

      <TabsContent value="services" className="space-y-2 mt-2">
        <ServiceManager
          salonId={salon.id}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-2 mt-2">
        <AdminSettingsPanel 
          salon={salon}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </div>
  );
};

export default AdminDashboardContent;
