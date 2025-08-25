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
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('transaction_type', 'income')
        .eq('status', 'completed')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('💰 Transações encontradas para o salão:', transactions?.length || 0);

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

  // Métricas do dia
  const todayMetrics = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTransactions = transactionRows.filter(row => row.date === today);
    
    const totalValue = todayTransactions.reduce((sum, row) => sum + row.value, 0);
    const mainServices = todayTransactions.filter(row => !row.isAdditional).length;
    const additionalServices = todayTransactions.filter(row => row.isAdditional).length;
    
    return {
      totalValue,
      totalTransactions: todayTransactions.length,
      mainServices,
      additionalServices
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

      {/* Métricas de Hoje */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Receita de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(todayMetrics.totalValue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Total de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {todayMetrics.totalTransactions}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Serviços realizados hoje
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">
              Serviços Principais
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {todayMetrics.mainServices}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Atendimentos principais
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">
              Serviços Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {todayMetrics.additionalServices}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Serviços extras
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Estilo Excel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            📋 Planilha de Resumo - Formato Excel
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {transactionRows.length} registros
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              Cada linha = 1 serviço
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