
import { useSalonData } from './useSalonData';
import { useServiceData } from './useServiceData';
import { useDashboardData } from './useDashboardData';

export const useDataRefresh = () => {
  const salonData = useSalonData();
  const serviceData = useServiceData();
  const dashboardData = useDashboardData();

  // Enhanced refresh data function - OTIMIZADO
  const refreshData = async () => {
    try {
      await Promise.all([
        salonData.fetchAllSalons(),
        serviceData.fetchPresetServices(),
        dashboardData.fetchDashboardStats(),
        dashboardData.fetchPlanConfigurations()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return {
    refreshData
  };
};
