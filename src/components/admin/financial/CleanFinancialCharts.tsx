
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

interface CleanFinancialChartsProps {
  revenueData: Array<{
    month: string;
    revenue: number;
    appointments: number;
    growth: number;
  }>;
  servicesData: Array<{
    name: string;
    revenue: number;
    count: number;
    percentage: number;
  }>;
  dailyData: Array<{
    day: string;
    revenue: number;
    appointments: number;
    averageTicket?: number;
  }>;
}

const CleanFinancialCharts = ({ revenueData, servicesData, dailyData }: CleanFinancialChartsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Estatísticas resumidas dos dados diários
  const dailyStats = React.useMemo(() => {
    const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
    const totalAppointments = dailyData.reduce((sum, day) => sum + day.appointments, 0);
    const avgDailyRevenue = totalRevenue / dailyData.length;
    const bestDay = dailyData.reduce((best, day) => day.revenue > best.revenue ? day : best, dailyData[0]);

    return {
      avgDailyRevenue,
      bestDay
    };
  }, [dailyData]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Receita Mensal</TabsTrigger>
          <TabsTrigger value="daily">Análise Diária</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0088FE" 
                    fill="#0088FE" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          {/* Estatísticas Resumidas */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Média Diária</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(dailyStats.avgDailyRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Melhor Dia</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(dailyStats.bestDay?.revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500">{dailyStats.bestDay?.day}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Receita Diária */}
          <Card>
            <CardHeader>
              <CardTitle>Receita Diária (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelFormatter={(label) => `Dia: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={servicesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {servicesData.map((_, index) => (
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
                <CardTitle>Top 5 Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicesData.slice(0, 5).map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.count} atendimentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(service.revenue)}</p>
                        <p className="text-xs text-gray-500">{service.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CleanFinancialCharts;
