
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, BarChart3 } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface FinancialTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  status: string;
}

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
  transactions?: FinancialTransaction[];
}

const DailySummaryCard = ({ todayData, yesterdayData, transactions = [] }: DailySummaryCardProps) => {
  // Calcular dados financeiros reais das transações
  const financialData = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Receita de hoje baseada nas transações
    const todayRevenue = transactions
      .filter(t => 
        t.transaction_type === 'income' && 
        t.status === 'completed' && 
        t.transaction_date === today
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Receita de ontem baseada nas transações
    const yesterdayRevenue = transactions
      .filter(t => 
        t.transaction_type === 'income' && 
        t.status === 'completed' && 
        t.transaction_date === yesterday
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Usar dados das transações se disponíveis, senão usar dados dos agendamentos
    const finalTodayRevenue = transactions.length > 0 ? todayRevenue : todayData.revenue;
    const finalYesterdayRevenue = transactions.length > 0 ? yesterdayRevenue : yesterdayData.revenue;
    
    return {
      todayRevenue: finalTodayRevenue,
      yesterdayRevenue: finalYesterdayRevenue
    };
  }, [transactions, todayData.revenue, yesterdayData.revenue]);

  // Dados para gráfico de barras dos últimos 7 dias
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRevenue = transactions
        .filter(t => 
          t.transaction_type === 'income' && 
          t.status === 'completed' && 
          t.transaction_date === dateStr
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      data.push({
        day: format(date, 'dd/MM'),
        revenue: dayRevenue,
        isToday: i === 0
      });
    }
    return data;
  }, [transactions]);

  const revenueGrowth = financialData.yesterdayRevenue > 0 
    ? ((financialData.todayRevenue - financialData.yesterdayRevenue) / financialData.yesterdayRevenue) * 100 
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

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-foreground text-base">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          📊 Resumo Financeiro de Hoje
          <span className="text-xs font-normal ml-2 text-muted-foreground">
            {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Receita de Hoje */}
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Receita Hoje</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(financialData.todayRevenue)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center mt-1">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs ontem</span>
            </div>
          </div>

          {/* Agendamentos de Hoje */}
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agendamentos</p>
                <p className="text-lg font-bold text-accent">
                  {todayData.appointments}
                </p>
              </div>
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="flex items-center mt-1">
              {appointmentsGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${appointmentsGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Math.abs(appointmentsGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs ontem</span>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
                <p className="text-lg font-bold text-secondary">
                  {formatCurrency(todayData.averageTicket)}
                </p>
              </div>
              <div className="h-6 w-6 bg-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-secondary font-bold text-sm">₮</span>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                Média por atendimento
              </span>
            </div>
          </div>

          {/* Comparação com Ontem */}
          <div className="bg-background rounded-lg p-3 border border-border">
            <div>
              <p className="text-xs text-muted-foreground">Ontem</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(financialData.yesterdayRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                {yesterdayData.appointments} agendamentos
              </p>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                {format(new Date(Date.now() - 24 * 60 * 60 * 1000), "dd/MM", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolução dos Últimos 7 Dias */}
        <div className="bg-background rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-foreground text-sm">📈 Evolução dos Últimos 7 Dias</h4>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  labelFormatter={(label) => `Dia ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-background rounded-lg p-3 border border-border">
          <h4 className="font-semibold text-foreground mb-2 text-sm">💡 Insights do Dia</h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {financialData.todayRevenue > financialData.yesterdayRevenue ? (
              <p className="text-green-600">
                ✅ Receita {revenueGrowth.toFixed(1)}% superior ao dia anterior
              </p>
            ) : financialData.todayRevenue < financialData.yesterdayRevenue ? (
              <p className="text-orange-600">
                ⚠️ Receita {Math.abs(revenueGrowth).toFixed(1)}% inferior ao dia anterior
              </p>
            ) : (
              <p className="text-primary">
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
              <p className="text-primary">
                📊 Mesmo número de agendamentos que ontem
              </p>
            )}

            {todayData.averageTicket > 0 && (
              <p className="text-primary">
                🎯 Ticket médio de {formatCurrency(todayData.averageTicket)}
              </p>
            )}

            {transactions.length > 0 && (
              <p className="text-accent">
                💰 Dados baseados em transações financeiras reais
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummaryCard;
