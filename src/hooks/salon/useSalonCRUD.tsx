
import { useSalonCreate } from './useSalonCreate';
import { useSalonFetch } from './useSalonFetch';
import { useSalonUpdate } from './useSalonUpdate';

export const useSalonCRUD = () => {
  const createHook = useSalonCreate();
  const fetchHook = useSalonFetch();
  const updateHook = useSalonUpdate();

  return {
    // State from fetch hook
    salon: fetchHook.salon,
    salons: fetchHook.salons,
    loading: fetchHook.loading || createHook.loading,
    
    // Create operations
    createSalon: createHook.createSalon,
    
    // Fetch operations
    fetchSalonData: fetchHook.fetchSalonData,
    fetchSalonBySlug: fetchHook.fetchSalonBySlug,
    fetchAllSalons: fetchHook.fetchAllSalons,
    setSalon: fetchHook.setSalon,
    setSalons: fetchHook.setSalons,
    
    // Update operations
    updateSalon: updateHook.updateSalon,
    deleteSalon: updateHook.deleteSalon
  };
};
