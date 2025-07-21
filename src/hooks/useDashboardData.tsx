import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, PlanConfiguration } from './useSupabaseData';
import { usePlanConfigurations } from './usePlanConfigurations';

export const useDashboardData = () => {
  const { planConfigurations: configuredPlans } = usePlanConfigurations();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0
  });
  const [planConfigurations, setPlanConfigurations] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, services(price)');

      if (appointmentsError) {
        console.error('Error fetching appointments for stats:', appointmentsError);
        return;
      }

      const totalAppointments = appointmentsData?.length || 0;
      const pendingAppointments = appointmentsData?.filter(a => a.status === 'pending').length || 0;
      const completedAppointments = appointmentsData?.filter(a => a.status === 'completed').length || 0;
      const totalRevenue = appointmentsData?.filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.services?.price || 0), 0) || 0;

      // Fetch salon stats
      const { data: salonsData, error: salonsError } = await supabase
        .from('salons')
        .select('plan');

      // Fetch services count
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id');

      const totalServices = servicesData?.length || 0;

      if (!salonsError && salonsData) {
        const salonsByPlan = {
          bronze: salonsData.filter(s => s.plan === 'bronze').length,
          prata: salonsData.filter(s => s.plan === 'prata').length,
          gold: salonsData.filter(s => s.plan === 'gold').length
        };

        // Calculate expected revenue based on dynamic plan pricing
        const getPlanPrice = (planType: string) => {
          const plan = configuredPlans.find(p => p.plan_type === planType);
          return plan?.price || 0;
        };

        const expectedRevenue = {
          bronze: salonsByPlan.bronze * getPlanPrice('bronze'),
          prata: salonsByPlan.prata * getPlanPrice('prata'),
          gold: salonsByPlan.gold * getPlanPrice('gold'),
          total: (salonsByPlan.bronze * getPlanPrice('bronze')) + 
                 (salonsByPlan.prata * getPlanPrice('prata')) + 
                 (salonsByPlan.gold * getPlanPrice('gold'))
        };

        setDashboardStats({
          totalAppointments,
          pendingAppointments,
          completedAppointments,
          totalRevenue,
          totalSalons: salonsData.length,
          totalServices,
          salonsByPlan,
          expectedRevenue
        });
      } else {
        setDashboardStats({
          totalAppointments,
          pendingAppointments,
          completedAppointments,
          totalRevenue,
          totalSalons: 0,
          totalServices,
          salonsByPlan: { bronze: 0, prata: 0, gold: 0 },
          expectedRevenue: { total: 0, bronze: 0, prata: 0, gold: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plan configurations
  const fetchPlanConfigurations = async () => {
    try {
      setLoading(true);
      console.log('Fetching plan configurations...');
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('plan_type');

      if (error) {
        console.error('Error fetching plan configurations:', error);
        return;
      }

      console.log('Plan configurations fetched:', data);
      setPlanConfigurations(data || []);
    } catch (error) {
      console.error('Error fetching plan configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlanConfiguration = async ({ planData }: { planData: any }) => {
    try {
      const { data, error } = await supabase
        .from('plan_configurations')
        .update({
          name: planData.name,
          plan_type: planData.plan_type,
          price: planData.price,
          max_users: planData.max_users,
          max_appointments: planData.max_appointments,
          max_attendants: planData.max_attendants,
          description: planData.description
        })
        .eq('id', planData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan configuration:', error);
        return { success: false, message: 'Erro ao atualizar configuração do plano' };
      }

      // Atualizar o estado local
      setPlanConfigurations(prev => 
        prev.map(config => 
          config.id === planData.id ? { ...config, ...data } : config
        )
      );

      return { success: true, plan: data };
    } catch (error) {
      console.error('Error updating plan configuration:', error);
      return { success: false, message: 'Erro ao atualizar configuração do plano' };
    }
  };

  return {
    dashboardStats,
    planConfigurations,
    loading,
    fetchDashboardStats,
    fetchPlanConfigurations,
    updatePlanConfiguration,
    setDashboardStats,
    setPlanConfigurations
  };
};
