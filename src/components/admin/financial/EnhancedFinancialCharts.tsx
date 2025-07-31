
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, Clock } from 'lucide-react';

interface EnhancedFinancialChartsProps {
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
    completedAppointments?: number;
    cancelledAppointments?: number;
  }>;
}

const EnhancedFinancialCharts = ({ revenueData, servicesData, dailyData }: EnhancedFinancialChartsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calcular estatísticas dos dados diários
  const dailyStats = React.useMemo(() => {
    const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
    const totalAppointments = dailyData.reduce((sum, day) => sum + day.appointments, 0);
    const avgDailyRevenue = totalRevenue / dailyData.length;
    const avgDailyAppointments = totalAppointments / dailyData.length;
    const bestDay = dailyData.reduce((best, day) => day.revenue > best.revenue ? day : best, dailyData[0]);
    const worstDay = dailyData.reduce((worst, day) => day.revenue < worst.revenue ? day : worst, dailyData[0]);

    return {
      totalRevenue,
      totalAppointments,
      avgDailyRevenue,
      avgDailyAppointments,
      bestDay,
      worstDay
    };
  }, [dailyData]);

  // Dados enriquecidos para o gráfico diário
  const enrichedDailyData = dailyData.map(day => ({
    ...day,
    averageTicket: day.appointments > 0 ? day.revenue / day.appointments : 0,
    completedAppointments: day.appointments,
    cancelledAppointments: Math.floor(day.appointments * 0.1) // Simulado
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Análise Diária</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Estatísticas Diárias */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Atendimentos/Dia</p>
                    <p className="font-bold text-blue-600">
                      {dailyStats.avgDailyAppointments.toFixed(1)}
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

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-600">Dia Menor</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(dailyStats.worstDay?.revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500">{dailyStats.worstDay?.day}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Diários Detalhados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita Diária Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrichedDailyData}>
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

            <Card>
              <CardHeader>
                <CardTitle>Ticket Médio Diário</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrichedDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Ticket Médio']}
                      labelFormatter={(label) => `Dia: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageTicket" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Detalhada dos Dias */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Dia</th>
                      <th className="text-right p-2">Receita</th>
                      <th className="text-right p-2">Atendimentos</th>
                      <th className="text-right p-2">Ticket Médio</th>
                      <th className="text-center p-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedDailyData.map((day, index) => {
                      const isAboveAverage = day.revenue > dailyStats.avgDailyRevenue;
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{day.day}</td>
                          <td className="p-2 text-right font-semibold text-green-600">
                            {formatCurrency(day.revenue)}
                          </td>
                          <td className="p-2 text-right">{day.appointments}</td>
                          <td className="p-2 text-right">
                            {formatCurrency(day.averageTicket || 0)}
                          </td>
                          <td className="p-2 text-center">
                            <Badge 
                              variant={isAboveAverage ? "default" : "secondary"}
                              className={isAboveAverage ? "bg-green-100 text-green-800" : ""}
                            >
                              {isAboveAverage ? "Acima" : "Abaixo"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
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
                <CardTitle>Ranking de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {servicesData.map((service, index) => (
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
                        <p className="text-xs text-gray-500">{service.percentage.toFixed(1)}% do total</p>
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
              <CardTitle>Taxa de Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Crescimento']}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="growth" 
                    stroke="#FF8042" 
                    strokeWidth={3}
                    dot={{ fill: '#FF8042', strokeWidth: 2, r: 4 }}
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

export default EnhancedFinancialCharts;
