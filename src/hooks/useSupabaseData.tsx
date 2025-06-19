import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface Salon {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  plan: 'bronze' | 'prata' | 'gold';
  notification_sound: string;
  max_attendants: number;
  banner_image_url: string | null;
  street_number: string | null;
  city: string | null;
  state: string | null;
  contact_phone: string | null;
  opening_hours: any;
  is_open: boolean | null;
  setup_completed: boolean | null;
  created_at: string;
}

export interface PresetService {
  id: string;
  category: string;
  name: string;
  description: string | null;
  default_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface AdminUser {
  id: string;
  salon_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator' | 'super_admin';
  avatar_url: string;
}

export interface ClientAuth {
  id: string;
  name: string;
  password: string;
  phone: string;
  email: string;
}

export interface AdminAuth {
  id: string;
  salon_id: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator' | 'super_admin';
  avatar_url: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  deleted_at: string | null;
  clients?: Client;
  services?: Service;
}

export interface PlanConfiguration {
  id: string;
  plan_type: 'bronze' | 'prata' | 'gold';
  name: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalSalons: number;
  salonsByPlan: {
    bronze: number;
    prata: number;
    gold: number;
  };
  expectedRevenue: {
    bronze: number;
    prata: number;
    gold: number;
    total: number;
  };
  totalAppointments: number;
  totalServices: number;
}

export const useSupabaseData = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [planConfigurations, setPlanConfigurations] = useState<PlanConfiguration[]>([]);
  const [presetServices, setPresetServices] = useState<PresetService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (salonId?: string) => {
    try {
      let targetSalonId = salonId;

      if (!targetSalonId) {
        // Se não especificou salão, pega o primeiro
        const { data: salonData } = await supabase
          .from('salons')
          .select('*')
          .limit(1)
          .single();
        
        if (salonData) {
          targetSalonId = salonData.id;
          setSalon({
            ...salonData,
            plan: salonData.plan as 'bronze' | 'prata' | 'gold',
            banner_image_url: salonData.banner_image_url || null
          });
        }
      } else {
        // Buscar salão específico
        const { data: salonData } = await supabase
          .from('salons')
          .select('*')
          .eq('id', targetSalonId)
          .single();
        
        if (salonData) {
          setSalon({
            ...salonData,
            plan: salonData.plan as 'bronze' | 'prata' | 'gold',
            banner_image_url: salonData.banner_image_url || null
          });
        }
      }

      if (targetSalonId) {
        // Buscar agendamentos com dados dos clientes e serviços
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            clients(*),
            services(*)
          `)
          .eq('salon_id', targetSalonId);
        
        if (appointmentsData) {
          const typedAppointments = appointmentsData.map(apt => ({
            ...apt,
            status: apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
          }));
          setAppointments(typedAppointments);
        }

        // Buscar serviços
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', targetSalonId)
          .eq('active', true);
        
        if (servicesData) setServices(servicesData);

        // Buscar usuários admin
        const { data: usersData } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('salon_id', targetSalonId);
        
        if (usersData) {
          const typedUsers = usersData.map(user => ({
            ...user,
            role: user.role as 'admin' | 'manager' | 'collaborator' | 'super_admin'
          }));
          setAdminUsers(typedUsers);
        }
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSalons = async () => {
    try {
      const { data: salonsData } = await supabase
        .from('salons')
        .select('*')
        .order('name');
      
      if (salonsData) {
        const typedSalons = salonsData.map(salon => ({
          ...salon,
          plan: salon.plan as 'bronze' | 'prata' | 'gold',
          banner_image_url: salon.banner_image_url || null
        }));
        setSalons(typedSalons);
      }
    } catch (error) {
      console.error('Erro ao buscar salões:', error);
    }
  };

  const fetchPresetServices = async () => {
    try {
      const { data, error } = await supabase
        .from('preset_services')
        .select('*')
        .order('category, name');
      
      if (error) throw error;
      setPresetServices(data || []);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar serviços pré-estabelecidos:', error);
      return { success: false, message: 'Erro ao buscar serviços pré-estabelecidos' };
    }
  };

  const toggleSalonStatus = async (salonId: string, isOpen: boolean) => {
    try {
      const { error } = await supabase
        .from('salons')
        .update({ is_open: isOpen })
        .eq('id', salonId);
      
      if (error) throw error;
      
      // Atualizar estado local
      if (salon && salon.id === salonId) {
        setSalon({ ...salon, is_open: isOpen });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar status do salão:', error);
      return { success: false, message: 'Erro ao alterar status do salão' };
    }
  };

  const completeSalonSetup = async (salonId: string, setupData: {
    street_number?: string;
    city?: string;
    state?: string;
    contact_phone?: string;
    opening_hours?: any;
  }) => {
    try {
      const { error } = await supabase
        .from('salons')
        .update({ 
          ...setupData,
          setup_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', salonId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao finalizar configuração:', error);
      return { success: false, message: 'Erro ao finalizar configuração' };
    }
  };

  const createServicesFromPresets = async (salonId: string, selectedPresets: { presetId: string; price: number }[]) => {
    try {
      const servicesToCreate = [];
      
      for (const preset of selectedPresets) {
        const presetService = presetServices.find(p => p.id === preset.presetId);
        if (presetService) {
          servicesToCreate.push({
            salon_id: salonId,
            name: presetService.name,
            description: presetService.description,
            price: preset.price,
            duration_minutes: presetService.default_duration_minutes,
            active: true
          });
        }
      }

      const { error } = await supabase
        .from('services')
        .insert(servicesToCreate);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar serviços:', error);
      return { success: false, message: 'Erro ao criar serviços' };
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Buscar estatísticas dos salões
      const { data: salonsData } = await supabase
        .from('salons')
        .select('plan');
      
      if (salonsData) {
        const salonsByPlan = {
          bronze: salonsData.filter(s => s.plan === 'bronze').length,
          prata: salonsData.filter(s => s.plan === 'prata').length,
          gold: salonsData.filter(s => s.plan === 'gold').length,
        };

        // Valores dos planos (valores exemplo - ajustar conforme necessário)
        const planPrices = {
          bronze: 29.90,
          prata: 59.90,
          gold: 99.90,
        };

        const expectedRevenue = {
          bronze: salonsByPlan.bronze * planPrices.bronze,
          prata: salonsByPlan.prata * planPrices.prata,
          gold: salonsByPlan.gold * planPrices.gold,
          total: (salonsByPlan.bronze * planPrices.bronze) + 
                 (salonsByPlan.prata * planPrices.prata) + 
                 (salonsByPlan.gold * planPrices.gold),
        };

        // Buscar total de agendamentos
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('id');

        // Buscar total de serviços
        const { data: servicesData } = await supabase
          .from('services')
          .select('id');

        setDashboardStats({
          totalSalons: salonsData.length,
          salonsByPlan,
          expectedRevenue,
          totalAppointments: appointmentsData?.length || 0,
          totalServices: servicesData?.length || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchSalonDetails = async (salonId: string) => {
    try {
      // Buscar dados do salão
      const { data: salonData } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (salonData) {
        setSalon({
          ...salonData,
          plan: salonData.plan as 'bronze' | 'prata' | 'gold',
          banner_image_url: salonData.banner_image_url || null
        });
      }

      // Buscar total de clientes únicos que fizeram agendamentos neste salão
      const { data: clientsData } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('salon_id', salonId);

      const uniqueClients = clientsData ? new Set(clientsData.map(a => a.client_id)).size : 0;

      // Buscar faturamento do mês atual
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: monthlyAppointments } = await supabase
        .from('appointments')
        .select(`
          services(price)
        `)
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('appointment_date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('appointment_date', lastDayOfMonth.toISOString().split('T')[0]);

      const monthlyRevenue = monthlyAppointments?.reduce((total, apt) => {
        return total + (apt.services?.price || 0);
      }, 0) || 0;

      return {
        salon: salonData ? {
          ...salonData,
          plan: salonData.plan as 'bronze' | 'prata' | 'gold',
          banner_image_url: salonData.banner_image_url || null
        } : null,
        totalClients: uniqueClients,
        monthlyRevenue: Number(monthlyRevenue)
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do salão:', error);
      return {
        salon: null,
        totalClients: 0,
        monthlyRevenue: 0
      };
    }
  };

  const authenticateClient = async (name: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', name)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        return { success: false, message: 'Credenciais inválidas' };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro no login' };
    }
  };

  const authenticateAdmin = async (name: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', name)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        return { success: false, message: 'Credenciais inválidas' };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro no login' };
    }
  };

  const registerClient = async (name: string, password: string, phone: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('client_auth')
        .insert({ name, password, phone, email })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'Nome já está em uso' };
        }
        return { success: false, message: 'Erro ao criar conta' };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro ao criar conta' };
    }
  };

  const registerAdmin = async (salonId: string, name: string, password: string, email: string, phone?: string, role: 'admin' | 'manager' | 'collaborator' = 'admin') => {
    try {
      // Verificar limite de atendentes
      if (salon) {
        const currentCount = adminUsers.length;
        if (currentCount >= salon.max_attendants) {
          return { 
            success: false, 
            message: `Limite de ${salon.max_attendants} atendente(s) atingido. Faça upgrade do plano.`,
            needsUpgrade: true 
          };
        }
      }

      const { data, error } = await supabase
        .from('admin_auth')
        .insert({ salon_id: salonId, name, password, email, phone, role })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'Nome já está em uso' };
        }
        return { success: false, message: 'Erro ao criar conta' };
      }
      
      fetchData(); // Recarregar dados
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro ao criar conta' };
    }
  };

  const createSalon = async (salonData: {
    name: string;
    owner_name: string;
    phone: string;
    address: string;
    plan?: 'bronze' | 'prata' | 'gold';
  }) => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .insert({
          ...salonData,
          plan: salonData.plan || 'bronze'
        })
        .select()
        .single();
      
      if (error) {
        return { success: false, message: 'Erro ao criar estabelecimento' };
      }
      
      return { success: true, salon: data };
    } catch (error) {
      return { success: false, message: 'Erro ao criar estabelecimento' };
    }
  };

  const deleteSalon = async (salonId: string) => {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', salonId);
      
      if (!error) {
        await fetchAllSalons();
        return { success: true };
      }
      return { success: false, message: 'Erro ao excluir estabelecimento' };
    } catch (error) {
      return { success: false, message: 'Erro ao excluir estabelecimento' };
    }
  };

  const updateAppointmentStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (!error) {
        fetchData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  const updateSalon = async (salonData: Partial<Salon>) => {
    try {
      const { error } = await supabase
        .from('salons')
        .update(salonData)
        .eq('id', salon?.id || '');
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true };
      }
      return { success: false, message: 'Erro ao salvar alterações' };
    } catch (error) {
      return { success: false, message: 'Erro ao salvar alterações' };
    }
  };

  const updateAdminUser = async (userId: string, userData: Partial<AdminAuth>) => {
    try {
      const { error } = await supabase
        .from('admin_auth')
        .update(userData)
        .eq('id', userId);
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true };
      }
      return { success: false, message: 'Erro ao salvar alterações' };
    } catch (error) {
      return { success: false, message: 'Erro ao salvar alterações' };
    }
  };

  const deleteAdminUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_auth')
        .delete()
        .eq('id', userId);
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true };
      }
      return { success: false, message: 'Erro ao excluir usuário' };
    } catch (error) {
      return { success: false, message: 'Erro ao excluir usuário' };
    }
  };

  const createAppointment = async (appointmentData: {
    salon_id: string;
    client_id: string;
    service_id: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true, appointment: data };
      }
      return { success: false, message: 'Erro ao criar agendamento' };
    } catch (error) {
      return { success: false, message: 'Erro ao criar agendamento' };
    }
  };

  const fetchPlanConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('price');
      
      if (error) throw error;
      
      const typedConfigurations = (data || []).map(config => ({
        ...config,
        plan_type: config.plan_type as 'bronze' | 'prata' | 'gold'
      }));
      
      setPlanConfigurations(typedConfigurations);
      return { success: true, data: typedConfigurations };
    } catch (error) {
      console.error('Erro ao buscar configurações de planos:', error);
      return { success: false, message: 'Erro ao buscar configurações de planos' };
    }
  };

  const updatePlanConfiguration = async (planId: string, planData: Partial<PlanConfiguration>) => {
    try {
      const { error } = await supabase
        .from('plan_configurations')
        .update({ 
          ...planData,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);
      
      if (error) throw error;
      await fetchPlanConfigurations();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar configuração do plano:', error);
      return { success: false, message: 'Erro ao atualizar configuração do plano' };
    }
  };

  const uploadSalonBanner = async (file: File, salonId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${salonId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('salon-banners')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('salon-banners')
        .getPublicUrl(fileName);

      // Atualizar URL da imagem no salão
      const { error: updateError } = await supabase
        .from('salons')
        .update({ banner_image_url: publicUrl })
        .eq('id', salonId);

      if (updateError) throw updateError;

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return { success: false, message: 'Erro ao fazer upload da imagem' };
    }
  };

  const fetchAllAppointments = async (salonId: string, includeDeleted = false) => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients(*),
          services(*)
        `)
        .eq('salon_id', salonId);

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query.order('appointment_date', { ascending: false });
      
      if (error) throw error;
      
      const typedAppointments = (data || []).map(apt => ({
        ...apt,
        status: apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
      }));
      
      return { success: true, data: typedAppointments };
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return { success: false, message: 'Erro ao buscar agendamentos' };
    }
  };

  const restoreAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ deleted_at: null })
        .eq('id', appointmentId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao restaurar agendamento:', error);
      return { success: false, message: 'Erro ao restaurar agendamento' };
    }
  };

  const createService = async (serviceData: {
    salon_id: string;
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, service: data };
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      return { success: false, message: 'Erro ao criar serviço' };
    }
  };

  const cleanupSalonsWithoutAdmins = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_salons_without_admins');
      
      if (error) throw error;
      return { success: true, deletedCount: data || 0 };
    } catch (error) {
      console.error('Erro ao limpar estabelecimentos sem administradores:', error);
      return { success: false, message: 'Erro ao limpar estabelecimentos' };
    }
  };

  return {
    salon,
    salons,
    appointments,
    services,
    adminUsers,
    dashboardStats,
    planConfigurations,
    presetServices,
    loading,
    authenticateClient,
    authenticateAdmin,
    registerClient,
    registerAdmin,
    createSalon,
    deleteSalon,
    updateAppointmentStatus,
    updateSalon,
    updateAdminUser,
    deleteAdminUser,
    createAppointment,
    fetchAllSalons,
    fetchDashboardStats,
    fetchPlanConfigurations,
    updatePlanConfiguration,
    uploadSalonBanner,
    fetchAllAppointments,
    restoreAppointment,
    createService,
    cleanupSalonsWithoutAdmins,
    fetchPresetServices,
    toggleSalonStatus,
    completeSalonSetup,
    createServicesFromPresets,
    refreshData: fetchData,
    fetchSalonDetails
  };
};
