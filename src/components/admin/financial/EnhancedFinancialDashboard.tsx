import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EnhancedFinancialDashboardProps {
  salonId: string;
}

interface FinancialTransaction {
  id: string;
  amount: number;
  transaction_date: string;
  description: string;
  metadata?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const EnhancedFinancialDashboard = ({ salonId }: EnhancedFinancialDashboardProps) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [salonName, setSalonName] = useState('');
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadFinancialData = async () => {
    if (!salonId) {
      console.warn('Salon ID não fornecido para carregar dados financeiros');
      return;
    }

    setLoading(true);
    try {
      console.log('🏪 Carregando dados financeiros para salon:', salonId);
      
      // Buscar nome do salão
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select('name')
        .eq('id', salonId)
        .single();
      
      if (salonError) {
        console.error('Erro ao buscar salão:', salonError);
      } else if (salon) {
        setSalonName(salon.name);
        console.log('📍 Salão encontrado:', salon.name);
      }

      // Buscar transações dos últimos 12 meses
      const startDate = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
      console.log('📅 Buscando transações desde:', startDate, 'para salon:', salonId);
      
      const { data: transactionData, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('transaction_type', 'income')
        .eq('status', 'completed')
        .gte('transaction_date', startDate)
        .order('transaction_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
      }

      console.log('💰 Transações encontradas:', transactionData?.length || 0);
      setTransactions(transactionData || []);
      
      toast({
        title: "Dados carregados",
        description: `${transactionData?.length || 0} transações encontradas para ${salon?.name || 'o estabelecimento'}`,
      });

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados mensais para gráfico de barras
  const monthlyData = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return {
        month: format(date, "MMM/yy", { locale: ptBR }),
        fullDate: date,
        revenue: 0,
        appointments: 0,
        growth: 0
      };
    });

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const monthIndex = last12Months.findIndex(month => 
        format(month.fullDate, 'yyyy-MM') === format(transactionDate, 'yyyy-MM')
      );
      
      if (monthIndex !== -1) {
        last12Months[monthIndex].revenue += Number(transaction.amount);
        last12Months[monthIndex].appointments += 1;
      }
    });

    // Calcular crescimento
    last12Months.forEach((month, index) => {
      if (index > 0) {
        const previousRevenue = last12Months[index - 1].revenue;
        month.growth = previousRevenue > 0 
          ? ((month.revenue - previousRevenue) / previousRevenue) * 100 
          : 0;
      }
    });

    return last12Months;
  }, [transactions]);

  // Buscar dados do gráfico de pizza diretamente dos appointments
  useEffect(() => {
    const fetchPieChartData = async () => {
      if (!salonId) return;
      
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      
      console.log('🥧 Buscando serviços mais procurados para o período:', 
                  format(currentMonthStart, 'dd/MM/yyyy'), 'a', format(currentMonthEnd, 'dd/MM/yyyy'));
      
      try {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            service_id,
            status,
            services!inner(name)
          `)
          .eq('salon_id', salonId)
          .eq('status', 'completed')
          .gte('appointment_date', format(currentMonthStart, 'yyyy-MM-dd'))
          .lte('appointment_date', format(currentMonthEnd, 'yyyy-MM-dd'));

        if (error) {
          console.error('Erro ao buscar appointments:', error);
          return;
        }

        console.log('📊 Appointments finalizados no mês:', appointments?.length || 0);
        
        // Contar serviços por nome
        const serviceCount: { [key: string]: number } = {};
        
        appointments?.forEach(appointment => {
          const serviceName = appointment.services?.name;
          if (serviceName) {
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
          }
        });

        console.log('📈 Contagem de serviços:', serviceCount);

        // Converter para array e ordenar por quantidade
        const chartData = Object.entries(serviceCount)
          .map(([name, count], index) => ({
            name,
            value: count,
            fill: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setPieChartData(chartData);
      } catch (error) {
        console.error('Erro ao processar dados do gráfico de pizza:', error);
      }
    };

    fetchPieChartData();
  }, [salonId]);

  // Top 5 serviços mais procurados no mês atual
  const topServices = useMemo(() => {
    return pieChartData.map((item) => ({
      name: item.name,
      count: item.value,
      revenue: 0,
      percentage: pieChartData.length > 0 ? (item.value / pieChartData.reduce((sum, s) => sum + s.value, 0)) * 100 : 0
    }));
  }, [pieChartData]);

  // Métricas principais
  const metrics = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    const todayTransactions = transactions.filter(t => t.transaction_date === today);
    const monthTransactions = transactions.filter(t => t.transaction_date.startsWith(currentMonth));
    
    return {
      todayRevenue: todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      monthRevenue: monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      todayCount: todayTransactions.length,
      monthCount: monthTransactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      averageTicket: monthTransactions.length > 0 
        ? monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / monthTransactions.length 
        : 0
    };
  }, [transactions]);

  useEffect(() => {
    if (salonId) {
      loadFinancialData();
    }
  }, [salonId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-primary text-2xl">
                📊 Dashboard Financeiro Avançado
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {salonName} - Análise completa com gráficos e métricas detalhadas
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={loadFinancialData}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(metrics.todayRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              {metrics.todayCount} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(metrics.monthRevenue)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {metrics.monthCount} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(metrics.averageTicket)}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Valor médio mensal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Total Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Receita acumulada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Gráficos */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="monthly">Por Mês</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Receita Mensal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Receita por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Pizza - Top 5 Serviços */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  📊 Top 5 Serviços do Mês
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Serviços mais procurados em {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                </p>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum serviço encontrado para este mês
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Análise Mensal Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Serviços</CardTitle>
              <p className="text-sm text-muted-foreground">
                Os serviços mais procurados neste mês
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.count} atendimento{service.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {service.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {topServices.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum serviço encontrado para este período
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFinancialDashboard;