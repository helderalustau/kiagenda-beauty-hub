import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, DollarSign, Calendar, FileSpreadsheet, Building2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalonSpecificFinancialDashboardProps {
  salonId: string;
}

interface TransactionRow {
  date: string;
  clientName: string;
  serviceName: string;
  value: number;
  appointmentId: string;
  isAdditional: boolean;
  transactionId: string;
}

const SalonSpecificFinancialDashboard = ({ salonId }: SalonSpecificFinancialDashboardProps) => {
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [salonName, setSalonName] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAdminInfo = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        setAdminName(admin.name || 'Administrador');
        return admin.salon_id;
      } catch (error) {
        console.error('Error parsing adminAuth:', error);
      }
    }
    return null;
  };

  const fetchSalonSpecificData = async () => {
    const currentSalonId = getAdminInfo();
    
    if (!currentSalonId || currentSalonId !== salonId) {
      console.error('Acesso negado: dados solicitados de salão diferente do logado');
      return;
    }

    setLoading(true);
    try {
      console.log('🏢 Carregando dados EXCLUSIVOS do salão:', salonId);
      
      // Buscar informações do salão
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('name')
        .eq('id', salonId)
        .single();

      if (salonError) throw salonError;
      setSalonName(salonData?.name || 'Salão');

      // Buscar transações APENAS do salão logado
      console.log('🔍 Buscando transações para salão:', salonId);
      
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('transaction_type', 'income')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      console.log('💰 Transações encontradas para o salão:', transactions?.length || 0);
      console.log('📋 Exemplo de transação:', transactions?.[0]);

      // Converter cada transação em uma linha da tabela
      const rows: TransactionRow[] = (transactions || []).map(transaction => {
        const metadata = transaction.metadata as any;
        return {
          date: transaction.transaction_date,
          clientName: metadata?.client_name || 'Cliente',
          serviceName: metadata?.service_name || 'Serviço',
          value: Number(transaction.amount),
          appointmentId: transaction.appointment_id || '',
          isAdditional: metadata?.additional || false,
          transactionId: transaction.id
        };
      });

      setTransactionRows(rows);
      
      toast({
        title: "Dados carregados",
        description: `${rows.length} registros encontrados para ${salonData?.name}`,
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros do salão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Métricas simplificadas para o dia a dia
  const businessMetrics = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Transações de hoje
    const todayTransactions = transactionRows.filter(row => row.date === today);
    const todayRevenue = todayTransactions.reduce((sum, row) => sum + row.value, 0);
    const todayServices = todayTransactions.length;
    
    // Transações do mês
    const monthTransactions = transactionRows.filter(row => row.date.startsWith(currentMonth));
    const monthRevenue = monthTransactions.reduce((sum, row) => sum + row.value, 0);
    const monthServices = monthTransactions.length;
    
    // Ticket médio do dia
    const averageTicket = todayServices > 0 ? todayRevenue / todayServices : 0;
    
    return {
      todayRevenue,
      todayServices,
      monthRevenue,
      monthServices,
      averageTicket,
      totalTransactions: transactionRows.length
    };
  }, [transactionRows]);

  useEffect(() => {
    if (salonId) {
      fetchSalonSpecificData();
    }
  }, [salonId]);

  return (
    <div className="space-y-6">
      {/* Header do Salão */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-blue-800 text-xl">
                <Building2 className="h-5 w-5 mr-2" />
                Dashboard Financeiro - {salonName}
              </CardTitle>
              <p className="text-blue-700 text-sm mt-1">
                Administrador: {adminName} • Dados exclusivos deste estabelecimento
              </p>
            </div>
            
            <Button
              onClick={fetchSalonSpecificData}
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

      {/* Resumo Essencial do Negócio */}
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
              {formatCurrency(businessMetrics.todayRevenue)}
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
              {formatCurrency(businessMetrics.monthRevenue)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {format(new Date(), "MMMM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Serviços Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {businessMetrics.todayServices}
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
              {formatCurrency(businessMetrics.averageTicket)}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Valor médio por serviço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Mensal */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <Calendar className="h-5 w-5 mr-2" />
            Resumo do Mês Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                {businessMetrics.monthServices}
              </div>
              <p className="text-sm text-indigo-700">Total de Serviços</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                {formatCurrency(businessMetrics.monthRevenue)}
              </div>
              <p className="text-sm text-indigo-700">Receita Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                {businessMetrics.monthServices > 0 ? Math.round(businessMetrics.monthServices / new Date().getDate()) : 0}
              </div>
              <p className="text-sm text-indigo-700">Média/Dia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Histórico de Atendimentos
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {businessMetrics.totalTransactions} registros
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              Receita: {formatCurrency(transactionRows.reduce((sum, row) => sum + row.value, 0))}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando dados do salão...</div>
            </div>
          ) : transactionRows.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">📊 Nenhum dado encontrado</div>
                <div className="text-sm">Aguardando atendimentos concluídos</div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-center">Data</TableHead>
                    <TableHead className="font-bold text-center">Nome do Cliente</TableHead>
                    <TableHead className="font-bold text-center">Serviço</TableHead>
                    <TableHead className="font-bold text-center">Valor</TableHead>
                    <TableHead className="font-bold text-center">Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionRows.map((row) => (
                    <TableRow 
                      key={row.transactionId} 
                      className="hover:bg-muted/30 border-b"
                    >
                      <TableCell className="text-center font-mono">
                        {format(new Date(row.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      
                      <TableCell className="text-center font-medium">
                        {row.clientName}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{row.serviceName}</span>
                          {row.isAdditional && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              Extra
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(row.value)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {row.isAdditional ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            ➕ Adicional
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            🎯 Principal
                          </Badge>
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

      {/* Footer de Segurança */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-blue-900">🔒 Acesso Restrito:</span>
              <span className="text-blue-700 ml-2">
                Apenas dados do salão "{salonName}" são exibidos
              </span>
            </div>
            <div className="text-blue-700">
              Admin: {adminName}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonSpecificFinancialDashboard;