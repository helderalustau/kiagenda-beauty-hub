
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Appointment, Service } from '@/hooks/useSupabaseData';
import { Salon } from '@/types/supabase-entities';
import WeeklyCalendar from './WeeklyCalendar';
import FinancialDashboard from './admin/FinancialDashboard';
import ServiceManager from './ServiceManager';
import SalonInfoManager from './settings/SalonInfoManager';
import OpeningHoursManager from './settings/OpeningHoursManager';
import AdminAppointmentsSummary from './AdminAppointmentsSummary';
import SalonUsersManager from './settings/SalonUsersManager';
import CleanDashboardOverview from './admin/CleanDashboardOverview';

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
  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <CleanDashboardOverview 
          appointments={appointments}
          services={services}
          salon={salon}
        />
      </TabsContent>

      <TabsContent value="agenda" className="space-y-6">
        {/* Agenda de Hoje - apenas agendamentos de hoje */}
        <AdminAppointmentsSummary
          appointments={appointments}
          selectedDate={new Date()}
          loading={false}
          showFutureOnly={false}
        />
        
        {/* Próximos Agendamentos - apenas agendamentos futuros */}
        <AdminAppointmentsSummary
          appointments={appointments}
          selectedDate={new Date()}
          loading={false}
          showFutureOnly={true}
        />
        
        <WeeklyCalendar 
          appointments={appointments}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="financial" className="space-y-6">
        <FinancialDashboard appointments={appointments} />
      </TabsContent>

      <TabsContent value="services" className="space-y-6">
        <ServiceManager
          salonId={salon.id}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <SalonInfoManager salon={salon} onUpdate={onRefresh} />
        <OpeningHoursManager salonId={salon.id} onUpdate={onRefresh} />
        <SalonUsersManager 
          salonId={salon.id}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;
