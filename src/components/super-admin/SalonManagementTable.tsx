import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit2, Crown, AlertTriangle, CheckCircle } from "lucide-react";
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface SalonData {
  id: string;
  name: string;
  plan: string;
  is_open: boolean;
  setup_completed: boolean;
  owner_name: string;
  phone: string;
  state?: string;
  monthly_appointments: number;
  total_appointments: number;
}

interface SalonManagementTableProps {
  salons: any[];
  loading: boolean;
  onRefresh: () => void;
}

const SalonManagementTable = ({ salons, loading, onRefresh }: SalonManagementTableProps) => {
  const [salonStats, setSalonStats] = useState<SalonData[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const { getAllPlansInfo } = usePlanConfigurations();
  const { toast } = useToast();

  const plans = getAllPlansInfo();

  const fetchSalonStats = async () => {
    setLoadingStats(true);
    try {
      const { data: statsData, error } = await supabase
        .from('salons')
        .select(`
          id,
          name,
          plan,
          is_open,
          setup_completed,
          owner_name,
          phone,
          state,
          appointments:appointments(
            id,
            appointment_date,
            created_at
          )
        `);

      if (error) throw error;

      const processedStats = statsData?.map(salon => {
        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const monthlyAppointments = salon.appointments?.filter(
          (appointment: any) => new Date(appointment.appointment_date) >= firstDayOfMonth
        ).length || 0;

        const totalAppointments = salon.appointments?.length || 0;

        return {
          ...salon,
          monthly_appointments: monthlyAppointments,
          total_appointments: totalAppointments
        };
      }) || [];

      setSalonStats(processedStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchSalonStats();
  }, [salons]);

  const getPlanInfo = (planType: string) => {
    return plans.find(p => p.plan_type === planType);
  };

  const getPlanStatus = (salon: SalonData) => {
    const planInfo = getPlanInfo(salon.plan);
    if (!planInfo) return { status: 'unknown', percentage: 0, remaining: 0 };

    const percentage = (salon.monthly_appointments / planInfo.max_appointments) * 100;
    const remaining = planInfo.max_appointments - salon.monthly_appointments;

    if (percentage >= 100) return { status: 'exceeded', percentage: 100, remaining: 0 };
    if (percentage >= 80) return { status: 'warning', percentage, remaining };
    if (percentage >= 60) return { status: 'moderate', percentage, remaining };
    return { status: 'good', percentage, remaining };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'good': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'good': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading || loadingStats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados dos estabelecimentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Gestão Detalhada de Estabelecimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estabelecimento</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Agendamentos (Mês)</TableHead>
                <TableHead>Utilização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Histórico</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salonStats.map((salon) => {
                const planInfo = getPlanInfo(salon.plan);
                const statusInfo = getPlanStatus(salon);
                
                return (
                  <TableRow key={salon.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{salon.name}</div>
                        <div className="text-sm text-gray-500">{salon.owner_name}</div>
                        <div className="text-xs text-gray-400">{salon.phone}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={salon.plan === 'gold' ? 'default' : 'secondary'}
                        className={`${
                          salon.plan === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          salon.plan === 'prata' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {salon.plan?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {salon.monthly_appointments}/{planInfo?.max_appointments || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        Restam: {statusInfo.remaining}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Progress 
                          value={statusInfo.percentage} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-600">
                          {statusInfo.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusInfo.status === 'exceeded' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {statusInfo.status === 'good' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        
                        <Badge 
                          variant="outline"
                          className={getStatusColor(statusInfo.status)}
                        >
                          {statusInfo.status === 'exceeded' ? 'Limite Excedido' :
                           statusInfo.status === 'warning' ? 'Atenção' :
                           statusInfo.status === 'moderate' ? 'Moderado' : 'Normal'}
                        </Badge>
                      </div>
                      
                      {!salon.setup_completed && (
                        <Badge variant="outline" className="mt-1 text-orange-600 bg-orange-50">
                          Setup Pendente
                        </Badge>
                      )}
                      
                      {!salon.is_open && salon.setup_completed && (
                        <Badge variant="outline" className="mt-1 text-red-600 bg-red-50">
                          Fechado
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">{salon.total_appointments}</div>
                      <div className="text-sm text-gray-500">agendamentos</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {salonStats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum estabelecimento encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalonManagementTable;