import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DirectFinancialDashboardProps {
  salonId: string;
}

interface FinancialTransaction {
  id: string;
  appointment_id: string | null;
  amount: number;
  description: string;
  transaction_date: string;
  status: string;
  metadata: any;
  created_at: string;
}

const DirectFinancialDashboard = ({ salonId }: DirectFinancialDashboardProps) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const fetchTransactionsDirectly = async () => {
    if (!salonId) return;

    setLoading(true);
    try {
      console.log('💰 Buscando transações DIRETAMENTE do banco para salon:', salonId);
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .eq('transaction_type', 'income')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar transações:', error);
        throw error;
      }

      console.log('✅ Transações encontradas:', data?.length || 0);
      console.log('📊 Detalhes das transações:', data);

      setTransactions(data || []);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados atualizados",
        description: `${data?.length || 0} transações carregadas diretamente do banco`,
      });

    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas diretamente das transações
  const metrics = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const todayRevenue = transactions
      .filter(t => t.transaction_date === today)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const monthRevenue = transactions
      .filter(t => t.transaction_date.startsWith(currentMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  useEffect(() => {
    fetchTransactionsDirectly();
  }, [salonId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-green-800 text-xl">
                💰 Dashboard Financeiro - Consulta Direta
              </CardTitle>
              <p className="text-green-700 text-sm mt-1">
                Dados obtidos diretamente do banco de dados em tempo real
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
                onClick={fetchTransactionsDirectly}
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

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Receita de Hoje */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Receita de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(metrics.todayRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Transações processadas hoje
            </p>
          </CardContent>
        </Card>

        {/* Receita do Mês */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Receita do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(metrics.monthRevenue)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Acumulado mensal
            </p>
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Total histórico
            </p>
          </CardContent>
        </Card>

        {/* Total de Transações */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {metrics.totalTransactions}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Total processadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            📋 Transações Detalhadas (1 linha = 1 transação)
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            {transactions.length} registros encontrados
          </Badge>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando transações...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">⚠️ Nenhuma transação encontrada</div>
                <div className="text-sm">Verifique se há agendamentos concluídos</div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Cliente</TableHead>
                    <TableHead className="text-center">Serviço</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium text-sm truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                          {transaction.appointment_id && (
                            <div className="text-xs text-muted-foreground mt-1">
                              📋 ID: {transaction.appointment_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="font-medium text-sm">
                          {transaction.metadata?.client_name || 'N/A'}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="text-sm space-y-1">
                          <div>{transaction.metadata?.service_name || 'N/A'}</div>
                          {transaction.metadata?.additional && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              ➕ Adicional
                            </Badge>
                          )}
                          {!transaction.metadata?.additional && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              🎯 Principal
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-bold text-lg text-green-600">
                          +{formatCurrency(Number(transaction.amount))}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-800">
                          💰 Receita
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer de confirmação */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900 mb-1">✅ Consulta Direta do Banco</h4>
              <p className="text-sm text-green-700">
                Estes dados vêm DIRETAMENTE da tabela `financial_transactions` do banco de dados.
                Não há cache ou processamento intermediário.
              </p>
            </div>
            
            <div className="text-right text-sm text-green-700">
              <div className="font-medium">Fonte: Banco de Dados</div>
              <div>Status: ✅ Conectado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectFinancialDashboard;