
import { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

export const useSalonSetup = () => {
  const { 
    salon, 
    presetServices, 
    fetchPresetServices,
    completeSalonSetup, 
    createServicesFromPresets,
    fetchSalonData,
    updateSalon,
    loading 
  } = useSupabaseData();
  
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    salon_name: '',
    street_number: '',
    city: '',
    state: '',
    contact_phone: '',
    opening_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    }
  });
  
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: { selected: boolean; price: number } }>({});

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Get correct salon ID from localStorage
  const getSalonId = () => {
    // Try adminAuth first
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        if (admin.salon_id) {
          console.log('SalonSetup - Salon ID encontrado em adminAuth:', admin.salon_id);
          return admin.salon_id;
        }
      } catch (error) {
        console.error('SalonSetup - Erro ao parsear adminAuth:', error);
      }
    }

    // Fallback to selectedSalonId
    const selectedSalonId = localStorage.getItem('selectedSalonId');
    if (selectedSalonId) {
      console.log('SalonSetup - Salon ID encontrado em selectedSalonId:', selectedSalonId);
      return selectedSalonId;
    }

    console.error('SalonSetup - Nenhum salon ID encontrado');
    return null;
  };

  // Initialize data only once
  useEffect(() => {
    if (initialized) return;

    const initializeData = async () => {
      try {
        console.log('SalonSetup - Inicializando dados...');
        
        const salonId = getSalonId();
        
        if (!salonId) {
          toast({
            title: "Erro",
            description: "ID do estabelecimento não encontrado. Redirecionando...",
            variant: "destructive"
          });
          setTimeout(() => window.location.href = '/admin-login', 2000);
          return;
        }

        // Load data in parallel but only once
        await Promise.all([
          fetchSalonData(salonId),
          fetchPresetServices()
        ]);

        setInitialized(true);
        console.log('SalonSetup - Dados inicializados com sucesso');
        
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Tente novamente.",
          variant: "destructive"
        });
      }
    };

    initializeData();
  }, [initialized, fetchSalonData, fetchPresetServices, toast]);

  // Update form data when salon is loaded
  useEffect(() => {
    if (salon && initialized) {
      console.log('SalonSetup - Atualizando dados do formulário');
      setFormData(prev => ({
        ...prev,
        salon_name: salon.name && !salon.name.startsWith('EST-') ? salon.name : '',
        street_number: salon.street_number || '',
        city: salon.city || '',
        state: salon.state || '',
        contact_phone: salon.contact_phone || '',
        opening_hours: salon.opening_hours || prev.opening_hours
      }));
    }
  }, [salon, initialized]);

  return {
    salon,
    presetServices,
    loading: loading || !initialized,
    currentStep,
    setCurrentStep,
    isFinishing,
    setIsFinishing,
    formData,
    updateFormData,
    selectedServices,
    setSelectedServices,
    completeSalonSetup,
    createServicesFromPresets,
    updateSalon,
    toast
  };
};
