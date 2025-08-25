import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, DollarSign, TrendingUp, Calendar, BarChart3, AlertTriangle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MultiSalonFinancialDashboardProps {
  currentSalonId?: string;
}

interface FinancialSummary {
  salonId: string;
  salonName: string;
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  completedAppointments: number;
  missingTransactions: number;
  transactionCount: number;
}

const MultiSalonFinancialDashboard = ({ currentSalonId }: MultiSalonFinancialDashboardProps) => {
  const [summaries, setSummaries] = useState<FinancialSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const fetchAllSalonsFinancialData = async () => {
    setLoading(true);
    try {
      console.log('💰 Buscando dados financeiros de TODOS os salões...');
      
      // Buscar todos os salões com appointments
      const { data: salons, error: salonsError } = await supabase
        .from('salons')
        .select('id, name')
        .order('name');

      if (salonsError) throw salonsError;

      const summariesData: FinancialSummary[] = [];
      
      for (const salon of salons || []) {
        console.log(`🏪 Processando salão: ${salon.name} (${salon.id})`);
        
        // Buscar transações financeiras
        const { data: transactions } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('salon_id', salon.id)
          .eq('transaction_type', 'income')
          .eq('status', 'completed');

        // Buscar agendamentos concluídos de hoje
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, appointment_date')
          .eq('salon_id', salon.id)
          .eq('status', 'completed')
          .eq('appointment_date', '2025-08-25');

        const today = '2025-08-25';
        const currentMonth = '2025-08';
        
        const todayTransactions = transactions?.filter(t => t.transaction_date === today) || [];
        const monthTransactions = transactions?.filter(t => t.transaction_date.startsWith(currentMonth)) || [];
        
        const todayRevenue = todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const monthRevenue = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        // Calcular appointments sem transações
        const appointmentIds = appointments?.map(a => a.id) || [];
        const transactionAppointmentIds = transactions?.map(t => t.appointment_id).filter(Boolean) || [];
        const missingTransactions = appointmentIds.filter(id => !transactionAppointmentIds.includes(id)).length;

        summariesData.push({
          salonId: salon.id,
          salonName: salon.name,
          todayRevenue,
          monthRevenue,
          totalRevenue,
          completedAppointments: appointments?.length || 0,
          missingTransactions,
          transactionCount: transactions?.length || 0
        });

        console.log(`✅ ${salon.name}: Receita hoje R$ ${todayRevenue}, Transações: ${transactions?.length || 0}, Faltando: ${missingTransactions}`);
      }

      setSummaries(summariesData);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados atualizados",
        description: `Dados financeiros de ${summariesData.length} salões carregados`,
      });

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

  const syncMissingTransactions = async (salonId: string) => {
    try {
      console.log('🔄 Sincronizando transações para salão:', salonId);
      
      const { data, error } = await supabase.rpc('sync_missing_financial_transactions', {
        p_salon_id: salonId
      });

      if (error) throw error;

      console.log('✅ Resultado da sincronização:', data);
      
      toast({
        title: "Sincronização concluída",
        description: `${(data as any)?.transactions_created || 0} transações criadas`,
      });

      // Recarregar dados
      fetchAllSalonsFinancialData();

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Erro ao sincronizar transações",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAllSalonsFinancialData();
  }, []);

  const totalMetrics = summaries.reduce((acc, summary) => ({
    todayRevenue: acc.todayRevenue + summary.todayRevenue,
    monthRevenue: acc.monthRevenue + summary.monthRevenue,
    totalRevenue: acc.totalRevenue + summary.totalRevenue,
    completedAppointments: acc.completedAppointments + summary.completedAppointments,
    missingTransactions: acc.missingTransactions + summary.missingTransactions,
    transactionCount: acc.transactionCount + summary.transactionCount
  }), { todayRevenue: 0, monthRevenue: 0, totalRevenue: 0, completedAppointments: 0, missingTransactions: 0, transactionCount: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-green-800 text-xl">
                💰 Dashboard Financeiro Completo - Todos os Salões
              </CardTitle>
              <p className="text-green-700 text-sm mt-1">
                Visão completa dos dados financeiros de todos os estabelecimentos
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="text-green-600">Última atualização:</div>
                <div className="font-medium text-green-800">
                  {format(lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
              
              <Button
                onClick={fetchAllSalonsFinancialData}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Totais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Receita Total de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalMetrics.todayRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Todos os salões hoje
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Receita do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalMetrics.monthRevenue)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Acumulado mensal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(totalMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Total histórico
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {totalMetrics.transactionCount}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Transações processadas
            </p>
            {totalMetrics.missingTransactions > 0 && (
              <Badge variant="destructive" className="text-xs mt-1">
                {totalMetrics.missingTransactions} faltando
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela por Salão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            📊 Resumo por Estabelecimento
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando dados...</div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Estabelecimento</TableHead>
                    <TableHead className="text-center">Receita Hoje</TableHead>
                    <TableHead className="text-center">Receita Mês</TableHead>
                    <TableHead className="text-center">Receita Total</TableHead>
                    <TableHead className="text-center">Agendamentos</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((summary) => (
                    <TableRow 
                      key={summary.salonId} 
                      className={`hover:bg-muted/30 ${summary.salonId === currentSalonId ? 'bg-blue-50' : ''}`}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {summary.salonName}
                          {summary.salonId === currentSalonId && (
                            <Badge variant="outline" className="ml-2 text-xs">Atual</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-bold text-green-600">
                          {formatCurrency(summary.todayRevenue)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-bold text-blue-600">
                          {formatCurrency(summary.monthRevenue)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-bold text-purple-600">
                          {formatCurrency(summary.totalRevenue)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="text-sm">
                          <div>{summary.completedAppointments} concluídos</div>
                          <div className="text-muted-foreground">{summary.transactionCount} transações</div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {summary.missingTransactions > 0 ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {summary.missingTransactions} faltando
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            ✅ Sincronizado
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {summary.missingTransactions > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncMissingTransactions(summary.salonId)}
                          >
                            Sincronizar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiSalonFinancialDashboard;