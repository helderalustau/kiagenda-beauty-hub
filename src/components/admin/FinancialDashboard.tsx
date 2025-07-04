
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Users, Target, ArrowUp, ArrowDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/hooks/useSupabaseData';

interface FinancialDashboardProps {
  appointments: Appointment[];
}

const FinancialDashboard = ({ appointments }: FinancialDashboardProps) => {
  const financialData = useMemo(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    
    // Receita total
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + ((apt as any).service?.price || 0), 0);
    
    // Receita do mês atual
    const currentMonthRevenue = completedAppointments
      .filter(apt => isSameMonth(new Date(apt.appointment_date), now))
      .reduce((sum, apt) => sum + ((apt as any).service?.price || 0), 0);
    
    // Receita do mês anterior
    const lastMonthRevenue = completedAppointments
      .filter(apt => isSameMonth(new Date(apt.appointment_date), lastMonth))
      .reduce((sum, apt) => sum + ((apt as any).service?.price || 0), 0);
    
    // Crescimento percentual
    const growthPercentage = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    
    // Ticket médio
    const averageTicket = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;
    
    // Agendamentos por mês (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthAppointments = completedAppointments.filter(apt => 
        isSameMonth(new Date(apt.appointment_date), month)
      );
      const revenue = monthAppointments.reduce((sum, apt) => sum + ((apt as any).service?.price || 0), 0);
      
      monthlyData.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        revenue,
        appointments: monthAppointments.length
      });
    }
    
    // Serviços mais populares
    const serviceStats = completedAppointments.reduce((acc, apt) => {
      const serviceName = (apt as any).service?.name || 'Serviço não identificado';
      const servicePrice = (apt as any).service?.price || 0;
      
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 };
      }
      acc[serviceName].count++;
      acc[serviceName].revenue += servicePrice;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);
    
    const topServices = Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    return {
      totalRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      growthPercentage,
      averageTicket,
      completedAppointments: completedAppointments.length,
      monthlyData,
      topServices
    };
  }, [appointments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatório Financeiro</h2>
        <p className="text-gray-600">Análise detalhada do desempenho financeiro do seu estabelecimento</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em {financialData.completedAppointments} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData.currentMonthRevenue)}
            </div>
            <div className="flex items-center text-xs">
              {financialData.growthPercentage >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={financialData.growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(financialData.growthPercentage).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financialData.averageTicket)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por atendimento realizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {financialData.completedAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              Serviços concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Receita Mensal</TabsTrigger>
          <TabsTrigger value="services">Top Serviços</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita (Últimos 6 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Rentáveis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={financialData.topServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, revenue }) => `${name}: ${formatCurrency(revenue)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {financialData.topServices.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialData.topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.count} atendimentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(service.revenue)}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(service.revenue / service.count)} médio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Atendimentos']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#00C49F" 
                    strokeWidth={3}
                    dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
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

export default FinancialDashboard;
