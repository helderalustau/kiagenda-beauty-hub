
import { useSalonCRUD } from './salon/useSalonCRUD';
import { useSalonStatus } from './salon/useSalonStatus';
import { useSalonBanner } from './salon/useSalonBanner';
import { useSalonSetupCompletion } from './salon/useSalonSetupCompletion';
import { useSalonCleanup } from './salon/useSalonCleanup';

export const useSalonData = () => {
  const crudHook = useSalonCRUD();
  const statusHook = useSalonStatus();
  const bannerHook = useSalonBanner();
  const setupHook = useSalonSetupCompletion();
  const cleanupHook = useSalonCleanup();

  return {
    // State from CRUD hook
    salon: crudHook.salon,
    salons: crudHook.salons,
    loading: crudHook.loading || setupHook.loading,
    
    // CRUD operations
    createSalon: crudHook.createSalon,
    fetchSalonData: crudHook.fetchSalonData,
    fetchSalonBySlug: crudHook.fetchSalonBySlug,
    fetchAllSalons: crudHook.fetchAllSalons,
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
    cleanupSalonsWithoutAdmins: cleanupHook.cleanupSalonsWithoutAdmins
  };
};
