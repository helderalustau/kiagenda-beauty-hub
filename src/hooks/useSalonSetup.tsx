
import { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

export const useSalonSetup = () => {
  const { 
    salon, 
    categories,
    presetServices, 
    fetchCategories,
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    salon_name: '',
    category_id: '',
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

  // Initialize data on mount - executar apenas uma vez
  useEffect(() => {
    if (dataLoaded) return; // Evitar múltiplas execuções

    console.log('SalonSetup - Carregando dados iniciais...');
    
    const adminData = localStorage.getItem('adminData');
    const selectedSalonId = localStorage.getItem('selectedSalonId');
    
    console.log('Admin data:', adminData);
    console.log('Selected salon ID:', selectedSalonId);
    
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        const salonId = selectedSalonId || admin.salon_id;
        
        console.log('Salon ID encontrado:', salonId);
        
        if (salonId) {
          console.log('Buscando dados do estabelecimento...');
          
          // Carregar todos os dados em paralelo para acelerar
          Promise.all([
            fetchSalonData(salonId),
            fetchCategories(),
            fetchPresetServices()
          ]).then(() => {
            setDataLoaded(true);
            console.log('Todos os dados carregados com sucesso');
          }).catch(error => {
            console.error('Erro ao carregar dados:', error);
            toast({
              title: "Erro",
              description: "Erro ao carregar dados. Tente novamente.",
              variant: "destructive"
            });
          });
        } else {
          console.error('Salon ID não encontrado!');
          toast({
            title: "Erro",
            description: "ID do estabelecimento não encontrado. Redirecionando...",
            variant: "destructive"
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao processar dados do admin:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Redirecionando...",
          variant: "destructive"
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } else {
      console.error('Dados do admin não encontrados!');
      toast({
        title: "Erro",
        description: "Dados do administrador não encontrados. Redirecionando...",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [dataLoaded]); // Dependência apenas do dataLoaded

  // Update form data when salon is loaded - executar apenas quando salon mudar
  useEffect(() => {
    if (salon && dataLoaded) {
      console.log('Estabelecimento carregado:', salon);
      setFormData(prev => ({
        ...prev,
        salon_name: salon.name === 'Estabelecimento Temporário' ? '' : salon.name,
        category_id: salon.category_id === '00000000-0000-0000-0000-000000000000' ? '' : salon.category_id || '',
        street_number: salon.street_number || '',
        city: salon.city || '',
        state: salon.state || '',
        contact_phone: salon.contact_phone || '',
        opening_hours: salon.opening_hours || prev.opening_hours
      }));
    }
  }, [salon, dataLoaded]);

  return {
    salon,
    categories,
    presetServices,
    loading: loading || !dataLoaded,
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
