
import { useSalonData } from './useSalonData';
import { useServiceData } from './useServiceData';
import { useDashboardData } from './useDashboardData';

export const useDataRefresh = () => {
  const salonData = useSalonData();
  const serviceData = useServiceData();
  const dashboardData = useDashboardData();

  // Enhanced refresh data function
  const refreshData = async () => {
    console.log('Refreshing all data...');
    try {
      await Promise.all([
        salonData.fetchAllSalons(),
        serviceData.fetchPresetServices(),
        dashboardData.fetchDashboardStats(),
        dashboardData.fetchPlanConfigurations()
      ]);
      console.log('All data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return {
    refreshData
  };
};
