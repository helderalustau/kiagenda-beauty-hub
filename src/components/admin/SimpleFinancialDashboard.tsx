import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SimpleFinancialDashboardProps {
  salonId: string;
}

const SimpleFinancialDashboard = ({ salonId }: SimpleFinancialDashboardProps) => {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [todayServices, setTodayServices] = useState(0);
  const [monthServices, setMonthServices] = useState(0);
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
    console.log('🚀 Iniciando carregamento de dados financeiros para salão:', salonId);
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

      // Buscar TODAS as transações financeiras
      console.log('🔍 Fazendo query das transações...');
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('transaction_type', 'income');

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      console.log('💰 Transações encontradas:', transactions?.length || 0);
      console.log('📊 Exemplos de transações:', transactions?.slice(0, 3));

      if (transactions && transactions.length > 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const currentMonth = format(new Date(), 'yyyy-MM');

        // Transações de hoje
        const todayTransactions = transactions.filter(t => t.transaction_date === today);
        const todayTotal = todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        
        // Transações do mês
        const monthTransactions = transactions.filter(t => t.transaction_date.startsWith(currentMonth));
        const monthTotal = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

        console.log('📈 SimpleFinancialDashboard - Resumo calculado:', {
          today: { count: todayTransactions.length, total: todayTotal },
          month: { count: monthTransactions.length, total: monthTotal },
          salonId: salonId,
          formattedMonth: formatCurrency(monthTotal)
        });

        setTodayRevenue(todayTotal);
        setMonthRevenue(monthTotal);
        setTodayServices(todayTransactions.length);
        setMonthServices(monthTransactions.length);

        toast({
          title: "Dados carregados",
          description: `Encontradas ${transactions.length} transações financeiras`,
        });
      } else {
        console.log('⚠️ Nenhuma transação encontrada');
        setTodayRevenue(0);
        setMonthRevenue(0);
        setTodayServices(0);
        setMonthServices(0);
        
        toast({
          title: "Sem dados",
          description: "Nenhuma transação financeira encontrada",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      console.log('🎯 Componente montado, carregando dados para salão:', salonId);
      loadFinancialData();
    }
  }, [salonId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-blue-800 text-xl">
                Dashboard Financeiro Simplificado - {salonName}
              </CardTitle>
              <p className="text-blue-700 text-sm mt-1">
                Dados essenciais do estabelecimento
              </p>
            </div>
            
            <Button
              onClick={loadFinancialData}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Faturamento Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(todayRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Faturamento do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(monthRevenue)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {format(new Date(), "MMMM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Serviços Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {todayServices}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Atendimentos realizados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(todayServices > 0 ? todayRevenue / todayServices : 0)}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Valor médio por serviço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo do Mês */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <Calendar className="h-5 w-5 mr-2" />
            Resumo do Mês Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-900">
                {monthServices}
              </div>
              <p className="text-sm text-indigo-700">Total de Serviços</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-900">
                {formatCurrency(monthRevenue)}
              </div>
              <p className="text-sm text-indigo-700">Receita Total</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-900">
                {monthServices > 0 ? Math.round(monthServices / new Date().getDate()) : 0}
              </div>
              <p className="text-sm text-indigo-700">Média/Dia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> Salão ID: {salonId} | Status: {loading ? 'Carregando...' : 'Pronto'}
            <br />
            Hoje: {todayServices} serviços = {formatCurrency(todayRevenue)}
            <br />
            Mês: {monthServices} serviços = {formatCurrency(monthRevenue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleFinancialDashboard;