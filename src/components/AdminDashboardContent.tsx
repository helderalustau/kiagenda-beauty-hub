
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import DashboardStats from '@/components/DashboardStats';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import ServicesPage from '@/pages/ServicesPage';
import SettingsPage from '@/pages/SettingsPage';

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
  return (
    <>
      <TabsContent value="overview" className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Visão Geral
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Acompanhe as métricas do seu estabelecimento
          </p>
        </div>
        <DashboardStats 
          appointments={appointments}
          services={services}
          salon={salon}
          adminUsers={adminUsers}
        />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Agenda
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Gerencie os agendamentos do seu estabelecimento
          </p>
        </div>
        <WeeklyCalendar 
          appointments={appointments}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="services" className="space-y-4 sm:space-y-6">
        <ServicesPage 
          services={services}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 sm:space-y-6">
        <SettingsPage 
          salon={salon}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;
