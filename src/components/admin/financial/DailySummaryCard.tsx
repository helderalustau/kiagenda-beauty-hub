
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailySummaryData {
  date: string;
  revenue: number;
  appointments: number;
  averageTicket: number;
  growth: number;
}

interface DailySummaryCardProps {
  todayData: DailySummaryData;
  yesterdayData: DailySummaryData;
  financialTransactions?: Array<{
    id: string;
    amount: number;
    transaction_type: string;
    transaction_date: string;
    status: string;
  }>;
}

const DailySummaryCard = ({ todayData, yesterdayData, financialTransactions = [] }: DailySummaryCardProps) => {
  // Usar sempre os dados corretos das transações financeiras
  const actualTodayRevenue = React.useMemo(() => {
    console.log('💰 DailySummaryCard - Dados recebidos:', {
      todayDataRevenue: todayData.revenue,
      transactionsCount: financialTransactions.length,
      todayStr: format(new Date(), 'yyyy-MM-dd')
    });
    
    // Usar sempre os dados que vieram já calculados corretamente do dashboard
    return todayData.revenue;
  }, [todayData.revenue, financialTransactions]);

  const revenueGrowth = yesterdayData.revenue > 0 
    ? ((actualTodayRevenue - yesterdayData.revenue) / yesterdayData.revenue) * 100 
    : 0;

  const appointmentsGrowth = yesterdayData.appointments > 0
    ? ((todayData.appointments - yesterdayData.appointments) / yesterdayData.appointments) * 100
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular dados dos últimos 7 dias para o gráfico usando transações financeiras
  const last7DaysData = React.useMemo(() => {
    const today = new Date();
    const data = [];
    
    console.log('💰 Calculando gráfico 7 dias:', {
      transactionsTotal: financialTransactions.length
    });
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Usar sempre transações financeiras
      const dayRevenue = financialTransactions
        .filter(t => 
          t.transaction_type === 'income' && 
          t.status === 'completed' &&
          t.transaction_date === dateStr
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      console.log(`💰 Dia ${dateStr}: R$ ${dayRevenue}`);
      
      data.push({
        day: format(date, 'dd/MM'),
        revenue: dayRevenue,
        fullDate: dateStr
      });
    }
    
    return data;
  }, [financialTransactions]);


  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Calendar className="h-5 w-5 mr-2" />
          Resumo de Hoje
          <span className="text-sm font-normal ml-2 text-blue-600">
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receita de Hoje */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(actualTodayRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs ontem</span>
            </div>
          </div>

          {/* Agendamentos de Hoje */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {todayData.appointments}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {appointmentsGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${appointmentsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(appointmentsGrowth).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs ontem</span>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(todayData.averageTicket)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">₮</span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">
                Média por atendimento
              </span>
            </div>
          </div>

          {/* Comparação com Ontem */}
          <div className="bg-white rounded-lg p-4 border">
            <div>
              <p className="text-sm text-gray-600">Ontem</p>
              <p className="text-lg font-semibold text-gray-700">
                {formatCurrency(yesterdayData.revenue)}
              </p>
              <p className="text-sm text-gray-500">
                {yesterdayData.appointments} agendamentos
              </p>
            </div>
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-400">
                {format(new Date(Date.now() - 24 * 60 * 60 * 1000), "dd/MM", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolução dos Últimos 7 Dias */}
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold text-gray-900 mb-3">📊 Evolução da Receita (Últimos 7 dias)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
                labelFormatter={(label) => `Dia: ${label}`}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Insights do Dia</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {actualTodayRevenue > yesterdayData.revenue ? (
              <p className="text-green-600">
                ✅ Receita {revenueGrowth.toFixed(1)}% superior ao dia anterior
              </p>
            ) : actualTodayRevenue < yesterdayData.revenue ? (
              <p className="text-orange-600">
                ⚠️ Receita {Math.abs(revenueGrowth).toFixed(1)}% inferior ao dia anterior
              </p>
            ) : (
              <p className="text-blue-600">
                📊 Receita igual ao dia anterior
              </p>
            )}
            
            {todayData.appointments > yesterdayData.appointments ? (
              <p className="text-green-600">
                📈 {appointmentsGrowth.toFixed(1)}% mais agendamentos que ontem
              </p>
            ) : todayData.appointments < yesterdayData.appointments ? (
              <p className="text-orange-600">
                📉 {Math.abs(appointmentsGrowth).toFixed(1)}% menos agendamentos que ontem
              </p>
            ) : (
              <p className="text-blue-600">
                📊 Mesmo número de agendamentos que ontem
              </p>
            )}

            {todayData.averageTicket > 0 && (
              <p className="text-blue-600">
                🎯 Ticket médio de {formatCurrency(todayData.averageTicket)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummaryCard;
