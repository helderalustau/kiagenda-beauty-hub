import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, Eye, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancialTransaction {
  id: string;
  salon_id: string;
  appointment_id?: string | null;
  transaction_type: string;
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  transaction_date: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface DetailedFinancialTableProps {
  transactions: FinancialTransaction[];
  isLoading?: boolean;
}

const DetailedFinancialTable = ({ transactions, isLoading = false }: DetailedFinancialTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { variant: 'default' as const, label: 'Concluído', color: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary' as const, label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      income: { label: 'Receita', color: 'bg-green-100 text-green-800' },
      expense: { label: 'Despesa', color: 'bg-red-100 text-red-800' }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      service: { label: 'Serviço', color: 'bg-blue-100 text-blue-800' },
      product: { label: 'Produto', color: 'bg-purple-100 text-purple-800' },
      expense: { label: 'Despesa', color: 'bg-orange-100 text-orange-800' },
      other: { label: 'Outros', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = categoryMap[category as keyof typeof categoryMap] || categoryMap.other;
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (transaction.metadata?.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (transaction.metadata?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || transaction.transaction_type === filterType;
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof FinancialTransaction];
      let bValue: any = b[sortField as keyof FinancialTransaction];
      
      if (sortField === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterCategory, filterStatus, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />;
  };

  // Estatísticas resumidas
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const pendingIncome = transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netProfit = totalIncome - totalExpense;
    
    return {
      totalIncome,
      totalExpense,
      pendingIncome,
      netProfit,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Relatório Financeiro Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando transações...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            📊 Relatório Financeiro Detalhado
          </span>
          <div className="flex gap-2 text-sm font-normal">
            <Badge variant="outline">{stats.totalTransactions} transações</Badge>
            <Badge className="bg-green-100 text-green-800">{formatCurrency(stats.totalIncome)} receita</Badge>
            <Badge className="bg-red-100 text-red-800">{formatCurrency(stats.totalExpense)} despesas</Badge>
            <Badge className="bg-blue-100 text-blue-800">{formatCurrency(stats.netProfit)} lucro líquido</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="service">Serviços</SelectItem>
              <SelectItem value="product">Produtos</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCategory('all');
              setFilterStatus('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-32">
                  <Button variant="ghost" onClick={() => handleSort('transaction_date')} className="h-8 p-0 font-semibold">
                    Data {getSortIcon('transaction_date')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('description')} className="h-8 p-0 font-semibold">
                    Descrição {getSortIcon('description')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Categoria</TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => handleSort('amount')} className="h-8 p-0 font-semibold">
                    Valor {getSortIcon('amount')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Pagamento</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Cliente/Serviço</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {transactions.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação corresponde aos filtros aplicados'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium text-sm truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                        {transaction.metadata?.auto_generated && (
                          <div className="text-xs text-muted-foreground mt-1">
                            🤖 Gerada automaticamente
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTypeBadge(transaction.transaction_type)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getCategoryBadge(transaction.category)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold text-lg ${
                        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="capitalize">
                        {transaction.payment_method === 'cash' ? 'Dinheiro' :
                         transaction.payment_method === 'card' ? 'Cartão' :
                         transaction.payment_method === 'pix' ? 'PIX' : transaction.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.metadata && (
                        <div className="text-sm">
                          {transaction.metadata.client_name && (
                            <div className="font-medium">{transaction.metadata.client_name}</div>
                          )}
                          {transaction.metadata.service_name && (
                            <div className="text-muted-foreground">{transaction.metadata.service_name}</div>
                          )}
                          {transaction.metadata.additional && (
                            <Badge variant="secondary" className="text-xs mt-1">Adicional</Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Resumo da página */}
        {filteredAndSortedTransactions.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <span>
              Mostrando {filteredAndSortedTransactions.length} de {transactions.length} transações
            </span>
            <div className="flex gap-4">
              <span className="text-green-600 font-medium">
                +{formatCurrency(
                  filteredAndSortedTransactions
                    .filter(t => t.transaction_type === 'income')
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                )}
              </span>
              <span className="text-red-600 font-medium">
                -{formatCurrency(
                  filteredAndSortedTransactions
                    .filter(t => t.transaction_type === 'expense')
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedFinancialTable;