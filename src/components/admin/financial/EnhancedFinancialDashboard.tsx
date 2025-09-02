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

interface MonthlyData {
  month: string;
  revenue: number;
  appointments: number;
  growth: number;
}

interface ServiceData {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
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
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Buscar nome do salão
      const { data: salon } = await supabase
        .from('salons')
        .select('name')
        .eq('id', salonId)
        .single();
      
      if (salon) {
        setSalonName(salon.name);
      }

      // Buscar transações dos últimos 12 meses
      const { data: transactionData, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('transaction_type', 'income')
        .eq('status', 'completed')
        .gte('transaction_date', format(subMonths(new Date(), 12), 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: true });

      if (error) {
        throw error;
      }

      setTransactions(transactionData || []);
      
      toast({
        title: "Dados carregados",
        description: `${transactionData?.length || 0} transações encontradas`,
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

  // Top 5 serviços mais procurados
  const topServices = useMemo(() => {
    const serviceMap = new Map<string, { count: number; revenue: number }>();

    transactions.forEach(transaction => {
      // Extrair nome do serviço da descrição ou metadata
      let serviceName = 'Serviço Geral';
      
      if (transaction.metadata?.service_name) {
        serviceName = transaction.metadata.service_name;
      } else if (transaction.description) {
        const match = transaction.description.match(/Serviço(?:\s+adicional)?:\s*([^-]+)/);
        if (match) {
          serviceName = match[1].trim();
        }
      }

      const current = serviceMap.get(serviceName) || { count: 0, revenue: 0 };
      serviceMap.set(serviceName, {
        count: current.count + 1,
        revenue: current.revenue + Number(transaction.amount)
      });
    });

    const totalRevenue = Array.from(serviceMap.values()).reduce((sum, service) => sum + service.revenue, 0);

    return Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [transactions]);

  // Métricas atuais
  const currentMetrics = useMemo(() => {
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
              {formatCurrency(currentMetrics.todayRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              {currentMetrics.todayCount} serviços
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
              {formatCurrency(currentMetrics.monthRevenue)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {currentMetrics.monthCount} serviços
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
              {formatCurrency(currentMetrics.averageTicket)}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Valor médio do mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Total 12 Meses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(currentMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Últimos 12 meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">📊 Resultado Mensal</TabsTrigger>
          <TabsTrigger value="services">🎯 Top 5 Serviços</TabsTrigger>
          <TabsTrigger value="growth">📈 Crescimento</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Faturamento dos Últimos 12 Meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  🥇 Top 5 Serviços Mais Procurados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name.slice(0, 15)}... (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {topServices.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name) => [
                        `${value} atendimentos`, 
                        name === 'count' ? 'Quantidade' : name
                      ]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                        />
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {service.count} atendimentos
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {service.percentage.toFixed(1)}% do total
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(service.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(service.revenue / service.count)} médio
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📈 Taxa de Crescimento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Crescimento']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="growth" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFinancialDashboard;