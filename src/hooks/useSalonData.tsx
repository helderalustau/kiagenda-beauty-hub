
import { useSalonCRUD } from './salon/useSalonCRUD';
import { useSalonStatus } from './salon/useSalonStatus';
import { useSalonBanner } from './salon/useSalonBanner';
import { useSalonSetupCompletion } from './salon/useSalonSetupCompletion';
import { useSalonCleanup } from './salon/useSalonCleanup';
import { useSalonFinancialOperations } from './salon/useSalonFinancialOperations';

export const useSalonData = () => {
  const crudHook = useSalonCRUD();
  const statusHook = useSalonStatus();
  const bannerHook = useSalonBanner();
  const setupHook = useSalonSetupCompletion();
  const cleanupHook = useSalonCleanup();
  const financialHook = useSalonFinancialOperations();

  return {
    // State from CRUD hook
    salon: crudHook.salon,
    salons: crudHook.salons,
    loading: crudHook.loading || setupHook.loading,
    
    // CRUD operations with error handling
    createSalon: async (...args: Parameters<typeof crudHook.createSalon>) => {
      try {
        return await crudHook.createSalon(...args);
      } catch (error) {
        console.error('Error in createSalon:', error);
        throw error;
      }
    },
    
    fetchSalonData: async (...args: Parameters<typeof crudHook.fetchSalonData>) => {
      try {
        return await crudHook.fetchSalonData(...args);
      } catch (error) {
        console.error('Error in fetchSalonData:', error);
        throw error;
      }
    },
    
    fetchSalonBySlug: async (...args: Parameters<typeof crudHook.fetchSalonBySlug>) => {
      try {
        return await crudHook.fetchSalonBySlug(...args);
      } catch (error) {
        console.error('Error in fetchSalonBySlug:', error);
        throw error;
      }
    },
    
    fetchAllSalons: async () => {
      try {
        return await crudHook.fetchAllSalons();
      } catch (error) {
        console.error('Error in fetchAllSalons:', error);
        throw error;
      }
    },
    
    updateSalon: crudHook.updateSalon,
    deleteSalon: crudHook.deleteSalon,
    setSalon: crudHook.setSalon,
    setSalons: crudHook.setSalons,
    
    // Status operations
    toggleSalonStatus: statusHook.toggleSalonStatus,
    
    // Banner operations
    uploadSalonBanner: bannerHook.uploadSalonBanner,
    
    // Setup operations
    completeSalonSetup: setupHook.completeSalonSetup,
    
    // Cleanup operations
    cleanupSalonsWithoutAdmins: cleanupHook.cleanupSalonsWithoutAdmins,
    cleanupIncompleteSalons: cleanupHook.cleanupIncompleteSalons,
    
    // Financial operations
    clearSalonFinancialData: financialHook.clearSalonFinancialData
  };
};
