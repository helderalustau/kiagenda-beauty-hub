import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlanConfiguration {
  id: string;
  name: string;
  plan_type: string;
  price: number;
  max_users?: number;
  max_appointments?: number;
  max_attendants?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlanInfo {
  id: string;
  name: string;
  plan_type: string;
  price: string;
  priceNumber: number;
  max_users: number;
  max_appointments: number;
  max_attendants: number;
  description: string;
  color: string;
  features: string[];
}

export const usePlanConfigurations = () => {
  const [planConfigurations, setPlanConfigurations] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPlanConfigurations(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching plan configurations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanConfigurations();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanInfo = (planType: string): PlanInfo | null => {
    const plan = planConfigurations.find(p => p.plan_type === planType);
    if (!plan) return null;

    const getFeatures = (type: string): string[] => {
      switch (type) {
        case 'bronze':
          return [
            `Até ${plan.max_users || 1} usuário`,
            `Até ${plan.max_appointments || 50} agendamentos/mês`,
            `${plan.max_attendants || 1} atendente`,
            'Agendamentos básicos',
            'Suporte por email'
          ];
        case 'prata':
          return [
            `Até ${plan.max_users || 5} usuários`,
            `Até ${plan.max_appointments || 150} agendamentos/mês`,
            `Até ${plan.max_attendants || 3} atendentes`,
            'Notificações em tempo real',
            'Relatórios avançados',
            'Suporte prioritário'
          ];
        case 'gold':
          return [
            `Até ${plan.max_users || 10} usuários`,
            `Até ${plan.max_appointments || 500} agendamentos/mês`,
            `Até ${plan.max_attendants || 10} atendentes`,
            'Personalização completa',
            'API integrations',
            'Suporte 24/7',
            'Relatórios personalizados'
          ];
        default:
          return [];
      }
    };

    const getColor = (type: string): string => {
      switch (type) {
        case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'prata': return 'bg-gray-100 text-gray-800 border-gray-300';
        case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return {
      id: plan.id,
      name: plan.name,
      plan_type: plan.plan_type,
      price: formatCurrency(plan.price),
      priceNumber: plan.price,
      max_users: plan.max_users || 1,
      max_appointments: plan.max_appointments || 50,
      max_attendants: plan.max_attendants || 1,
      description: plan.description || '',
      color: getColor(plan.plan_type),
      features: getFeatures(plan.plan_type)
    };
  };

  const getAllPlansInfo = (): PlanInfo[] => {
    return planConfigurations
      .map(plan => getPlanInfo(plan.plan_type))
      .filter((plan): plan is PlanInfo => plan !== null)
      .sort((a, b) => {
        const order = { bronze: 1, prata: 2, gold: 3 };
        return (order[a.plan_type as keyof typeof order] || 99) - (order[b.plan_type as keyof typeof order] || 99);
      });
  };

  const getPlanLimits = (planType: string) => {
    const plan = planConfigurations.find(p => p.plan_type === planType);
    if (!plan) {
      return {
        max_users: 1,
        max_appointments: 50,
        max_attendants: 1,
        name: 'Bronze'
      };
    }

    return {
      max_users: plan.max_users || 1,
      max_appointments: plan.max_appointments || 50,
      max_attendants: plan.max_attendants || 1,
      name: plan.name
    };
  };

  return {
    planConfigurations,
    loading,
    error,
    fetchPlanConfigurations,
    getPlanInfo,
    getAllPlansInfo,
    getPlanLimits,
    formatCurrency
  };
};