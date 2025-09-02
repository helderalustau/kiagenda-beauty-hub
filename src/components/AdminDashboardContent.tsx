
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Appointment, Service } from '@/hooks/useSupabaseData';
import { Salon } from '@/types/supabase-entities';
import OptimizedAdminCalendarView from './admin/OptimizedAdminCalendarView';
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

  console.log('📊 AdminDashboardContent - Dados atuais:', {
    appointmentsCount: appointments.length,
    servicesCount: services.length,
    salonId: salon?.id,
    salonName: salon?.name
  });

  const handleUpdateStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      console.log('🔄 Dashboard: Atualizando status:', { id, status });
      const result = await updateAppointmentStatus(id, status as any);
      console.log('📊 Dashboard: Resultado completo:', result);
      
      if (result.success) {
        console.log('✅ Dashboard: Status atualizado com sucesso');
        // Trigger onRefresh to update the data
        setTimeout(() => {
          onRefresh();
        }, 1000);
        return true;
      } else {
        console.error('❌ Dashboard: Falha ao atualizar status:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Dashboard: Erro ao atualizar status:', error);
      return false;
    }
  };

  // Verificação de dados essenciais
  if (!salon?.id) {
    console.error('❌ Erro crítico: Dados do salon não encontrados');
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-semibold mb-2">Erro nos Dados do Estabelecimento</h2>
        <p className="text-red-600 text-sm">
          Não foi possível carregar os dados do estabelecimento. Tente recarregar a página ou faça login novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <TabsContent value="overview" className="space-y-2 mt-2">
        <CleanDashboardOverview 
          appointments={appointments}
          services={services}
          salon={salon}
          adminUsers={adminUsers}
          onUpdateStatus={handleUpdateStatus}
        />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-2 mt-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Agenda do Estabelecimento</h2>
          
          {/* Calendário Principal */}
          <OptimizedAdminCalendarView 
            appointments={appointments}
            onUpdateAppointment={async (id, updates) => {
              const result = await updateAppointmentStatus(id, updates.status as any);
              if (result.success) {
                await onRefresh();
              }
              return result.success;
            }}
            isUpdating={false}
          />
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
