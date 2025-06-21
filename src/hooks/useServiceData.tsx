
import { useServiceFetch } from './services/useServiceFetch';
import { useServiceCRUD } from './services/useServiceCRUD';
import { useServicePresets } from './services/useServicePresets';

export const useServiceData = () => {
  const fetchHook = useServiceFetch();
  const crudHook = useServiceCRUD();
  const presetsHook = useServicePresets();

  // Create services from presets - bridge function
  const createServicesFromPresets = async (salonId: string, selectedServices: { id: string; price: number }[]) => {
    return presetsHook.createServicesFromPresets(salonId, selectedServices, fetchHook.presetServices);
  };

  // Toggle service status with state update
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    const result = await crudHook.toggleServiceStatus(serviceId, currentStatus);
    
    if (result.success) {
      // Update local state immediately
      fetchHook.setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, active: !currentStatus } : service
      ));
    }
    
    return result;
  };

  // Update service with state update
  const updateService = async (serviceId: string, updateData: any) => {
    const result = await crudHook.updateService(serviceId, updateData);
    
    if (result.success) {
      // Update local state immediately
      fetchHook.setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...result.service } : service
      ));
    }
    
    return result;
  };

  // Create service with state update
  const createService = async (serviceData: any) => {
    const result = await crudHook.createService(serviceData);
    
    if (result.success) {
      // Update local state immediately
      fetchHook.setServices(prev => [...prev, result.service]);
    }
    
    return result;
  };

  // Delete service with state update
  const deleteService = async (serviceId: string) => {
    const result = await crudHook.deleteService(serviceId);
    
    if (result.success) {
      // Update local state immediately - remove from UI
      fetchHook.setServices(prev => prev.filter(service => service.id !== serviceId));
    }
    
    return result;
  };

  return {
    // State from fetch hook
    services: fetchHook.services,
    presetServices: fetchHook.presetServices,
    loading: fetchHook.loading || crudHook.loading || presetsHook.loading,
    
    // Fetch methods
    fetchSalonServices: fetchHook.fetchSalonServices,
    fetchPresetServices: fetchHook.fetchPresetServices,
    
    // CRUD methods with state updates
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    createServicesFromPresets,
    
    // State setters
    setServices: fetchHook.setServices,
    setPresetServices: fetchHook.setPresetServices
  };
};
