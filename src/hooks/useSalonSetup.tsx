
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

  const getSalonId = () => {
    console.log('Buscando salon ID no localStorage');
    
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        if (admin.salon_id) {
          console.log('Salon ID encontrado em adminAuth:', admin.salon_id);
          return admin.salon_id;
        }
      } catch (error) {
        console.error('Erro ao parsear adminAuth:', error);
      }
    }

    const selectedSalonId = localStorage.getItem('selectedSalonId');
    if (selectedSalonId) {
      console.log('Salon ID encontrado em selectedSalonId:', selectedSalonId);
      return selectedSalonId;
    }

    console.error('Nenhum salon ID encontrado no localStorage');
    return null;
  };

  // Verificar se setup já foi concluído
  useEffect(() => {
    if (salon && salon.admin_setup_completed === true && salon.setup_completed === true) {
      console.log('Setup já concluído, redirecionando para dashboard');
      toast({
        title: "Configuração já concluída",
        description: "Redirecionando para o painel administrativo...",
      });
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 1500);
    }
  }, [salon, toast]);

  // Inicializar dados apenas uma vez
  useEffect(() => {
    if (initialized) return;

    const initializeData = async () => {
      try {
        console.log('Inicializando dados do setup do salão...');
        
        const salonId = getSalonId();
        
        if (!salonId) {
          console.error('ID do estabelecimento não encontrado');
          toast({
            title: "Erro",
            description: "ID do estabelecimento não encontrado. Faça login novamente.",
            variant: "destructive"
          });
          setTimeout(() => window.location.href = '/admin-login', 2000);
          return;
        }

        console.log('Carregando dados para salon ID:', salonId);

        await Promise.all([
          fetchSalonData(salonId),
          fetchPresetServices()
        ]);

        setInitialized(true);
        console.log('Dados inicializados com sucesso');
        
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Tente fazer login novamente.",
          variant: "destructive"
        });
        setTimeout(() => window.location.href = '/admin-login', 2000);
      }
    };

    initializeData();
  }, [initialized, fetchSalonData, fetchPresetServices, toast]);

  // Atualizar dados do formulário quando salão for carregado
  useEffect(() => {
    if (salon && initialized) {
      console.log('Atualizando dados do formulário com dados do salão:', salon);
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
