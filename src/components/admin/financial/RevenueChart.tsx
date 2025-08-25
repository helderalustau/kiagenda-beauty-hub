import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

interface FinancialTransaction {
  id: string;
  salon_id: string;
  appointment_id?: string | null;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface RevenueChartProps {
  transactions: FinancialTransaction[];
}

const RevenueChart = ({ transactions }: RevenueChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const monthsData = [];

    // Gerar dados dos últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthRevenue = transactions
        .filter(t => {
          const transactionDate = new Date(t.transaction_date);
          return t.transaction_type === 'income' && 
                 t.status === 'completed' &&
                 transactionDate >= monthStart && 
                 transactionDate <= monthEnd;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthsData.push({
        month: format(monthDate, 'MMM', { locale: ptBR }),
        fullMonth: format(monthDate, 'MMMM yyyy', { locale: ptBR }),
        revenue: monthRevenue,
        displayRevenue: formatCurrency(monthRevenue)
      });
    }

    return monthsData;
  }, [transactions]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  const currentMonthRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousMonthRevenue = chartData[chartData.length - 2]?.revenue || 0;
  const growth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : currentMonthRevenue > 0 ? 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.fullMonth}</p>
          <p className="text-green-600 font-bold">
            Receita: {data.displayRevenue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            📊 Evolução da Receita - Últimos 6 Meses
          </CardTitle>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Crescimento</div>
            <div className={`text-lg font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo estatístico */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(currentMonthRevenue)}
              </div>
              <div className="text-gray-600">Mês Atual</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(maxRevenue)}
              </div>
              <div className="text-gray-600">Melhor Mês</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0) / 6)}
              </div>
              <div className="text-gray-600">Média Mensal</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;