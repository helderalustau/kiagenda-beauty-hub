
import { useSetupValidation } from '../validation/SetupValidation';

interface SetupCompletionProps {
  salon: any;
  formData: any;
  selectedServices: any;
  completeSalonSetup: (salonId: string, data: any) => Promise<any>;
  createServicesFromPresets: (salonId: string, services: any) => Promise<any>;
  setIsFinishing: (finishing: boolean) => void;
  toast: any;
}

export const useSetupCompletion = ({
  salon,
  formData,
  selectedServices,
  completeSalonSetup,
  createServicesFromPresets,
  setIsFinishing,
  toast
}: SetupCompletionProps) => {
  const { validateServicesBeforeFinish } = useSetupValidation();

  const handleFinishSetup = async () => {
    if (!salon) {
      toast({
        title: "Erro",
        description: "Dados do estabelecimento não encontrados",
        variant: "destructive"
      });
      return;
    }

    // Validação apenas do nome do estabelecimento e serviços selecionados
    if (!formData.salon_name?.trim()) {
      toast({
        title: "Erro",
        description: "Nome do estabelecimento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validação dos serviços antes de finalizar
    if (!validateServicesBeforeFinish(selectedServices, toast)) {
      return;
    }

    setIsFinishing(true);

    try {
      console.log('Setup - Finalizando configuração do estabelecimento...');
      
      // Prepare setup data - incluindo admin_setup_completed
      const setupData = {
        name: formData.salon_name,
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        contact_phone: formData.contact_phone,
        address: `${formData.street_number}, ${formData.city}, ${formData.state}`,
        opening_hours: formData.opening_hours,
        admin_setup_completed: true // Marcar que o admin completou a configuração
      };
      
      // Complete salon setup
      const setupResult = await completeSalonSetup(salon.id, setupData);

      if (!setupResult.success) {
        throw new Error(setupResult.message || 'Erro ao finalizar configuração');
      }

      console.log('Setup - Configuração do estabelecimento finalizada com sucesso');

      // Process selected services - apenas serviços com preço válido
      const selectedServicesList = Object.entries(selectedServices)
        .filter(([_, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return service.selected && service.price > 0;
        })
        .map(([serviceId, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return {
            id: serviceId,
            price: Number(service.price)
          };
        });

      console.log('Setup - Serviços válidos para criação:', selectedServicesList);

      if (selectedServicesList.length > 0) {
        console.log('Setup - Criando serviços selecionados...');
        
        const servicesResult = await createServicesFromPresets(salon.id, selectedServicesList);
        
        if (!servicesResult.success) {
          console.warn('Setup - Aviso: Alguns serviços podem não ter sido criados:', servicesResult.message);
          toast({
            title: "Aviso",
            description: "Estabelecimento configurado, mas alguns serviços podem não ter sido criados. Você pode adicioná-los manualmente na aba Serviços.",
            variant: "default"
          });
        } else {
          console.log('Setup - Serviços criados com sucesso:', servicesResult.services?.length || 0, 'serviços');
        }
      } else {
        console.log('Setup - Nenhum serviço válido foi selecionado para criação');
        toast({
          title: "Aviso",
          description: "Estabelecimento configurado sem serviços. Adicione serviços na aba Serviços para começar a receber agendamentos.",
          variant: "default"
        });
      }

      // Update localStorage with correct salon data
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        try {
          const admin = JSON.parse(adminAuth);
          admin.salon_id = salon.id;
          localStorage.setItem('adminAuth', JSON.stringify(admin));
          localStorage.setItem('selectedSalonId', salon.id);
          console.log('Setup - Dados do admin atualizados no localStorage');
        } catch (error) {
          console.error('Setup - Erro ao atualizar localStorage:', error);
        }
      }

      toast({
        title: "Sucesso!",
        description: "Estabelecimento configurado com sucesso! Redirecionando para o painel...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 1500);

    } catch (error) {
      console.error('Setup - Erro ao finalizar configuração:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao finalizar configuração",
        variant: "destructive"
      });
    } finally {
      setIsFinishing(false);
    }
  };

  return {
    handleFinishSetup
  };
};
