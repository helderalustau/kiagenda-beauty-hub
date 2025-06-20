import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, PlanConfiguration } from './useSupabaseData';

export const useDashboardData = () => {
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

        // Calculate expected revenue based on plan pricing
        const expectedRevenue = {
          bronze: salonsByPlan.bronze * 29.90,
          prata: salonsByPlan.prata * 59.90,
          gold: salonsByPlan.gold * 99.90,
          total: (salonsByPlan.bronze * 29.90) + (salonsByPlan.prata * 59.90) + (salonsByPlan.gold * 99.90)
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
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('plan_type');

      if (error) {
        console.error('Error fetching plan configurations:', error);
        return;
      }

      setPlanConfigurations(data || []);
    } catch (error) {
      console.error('Error fetching plan configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlanConfiguration = async (planData: any) => {
    try {
      const { data, error } = await supabase
        .from('plan_configurations')
        .update(planData)
        .eq('id', planData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan configuration:', error);
        return { success: false, message: 'Erro ao atualizar configuração do plano' };
      }

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
