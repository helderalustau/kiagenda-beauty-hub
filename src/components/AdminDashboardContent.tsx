
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import CleanDashboardOverview from '@/components/admin/CleanDashboardOverview';
import FinancialDashboard from '@/components/admin/FinancialDashboard';
import ServicesPage from '@/pages/ServicesPage';
import SettingsPage from '@/pages/SettingsPage';
import { useAppointmentData } from '@/hooks/useAppointmentData';

interface AdminDashboardContentProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: AdminUser[];
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

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    await updateAppointmentStatus(appointmentId, status);
    await onRefresh();
  };

  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <CleanDashboardOverview 
          appointments={appointments}
          services={services}
          salon={salon}
          adminUsers={adminUsers}
          onUpdateStatus={handleUpdateAppointmentStatus}
        />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-6">
        <WeeklyCalendar 
          appointments={appointments}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="financial" className="space-y-6">
        <FinancialDashboard appointments={appointments} />
      </TabsContent>

      <TabsContent value="services" className="space-y-6">
        <ServicesPage 
          services={services}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <SettingsPage 
          salon={salon}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;
