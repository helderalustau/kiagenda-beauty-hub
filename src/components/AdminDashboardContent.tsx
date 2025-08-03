
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

  console.log('📊 AdminDashboardContent - Renderizando:', {
    appointmentsCount: appointments.length,
    servicesCount: services.length,
    salonId: salon.id,
    salonName: salon.name
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      console.log('🔄 Dashboard: Updating status:', { id, status });
      const result = await updateAppointmentStatus(id, status as any);
      if (result.success) {
        console.log('✅ Dashboard: Status updated successfully');
        await onRefresh();
      } else {
        console.error('❌ Dashboard: Failed to update status:', result.message);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error updating status:', error);
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
        <div className="space-y-4">
          {/* Verificação de dados */}
          {!salon.id ? (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 text-sm">⚠️ Erro: ID do salon não encontrado</p>
            </div>
          ) : (
            <>
              {/* Resumo dos Agendamentos */}
              <AdminAppointmentsSummary
                appointments={appointments}
                selectedDate={new Date()}
                loading={false}
                showFutureOnly={false}
                onUpdateStatus={handleUpdateStatus}
              />
              
              {/* Calendário Principal - SEMPRE renderizado se houver salon.id */}
              <AdminCalendarView 
                salonId={salon.id}
                onRefresh={onRefresh}
              />
            </>
          )}
        </div>
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
