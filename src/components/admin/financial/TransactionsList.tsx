import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, Calendar, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface TransactionsListProps {
  transactions: FinancialTransaction[];
  isLoading: boolean;
}

const TransactionsList = ({ transactions, isLoading }: TransactionsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
    return type === 'income' ? (
      <Badge className="bg-green-100 text-green-800">
        💰 Receita
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        💸 Despesa
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      service: { label: '✂️ Serviço', color: 'bg-blue-100 text-blue-800' },
      product: { label: '🛍️ Produto', color: 'bg-purple-100 text-purple-800' },
      expense: { label: '💸 Despesa', color: 'bg-orange-100 text-orange-800' },
      other: { label: '📋 Outros', color: 'bg-gray-100 text-gray-800' }
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
      const matchesSearch = searchTerm === '' || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.metadata?.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.metadata?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || transaction.transaction_type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
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
  }, [transactions, searchTerm, filterType, filterStatus, sortField, sortDirection]);

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

  // Estatísticas da lista filtrada
  const filteredStats = useMemo(() => {
    const income = filteredAndSortedTransactions
      .filter(t => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = filteredAndSortedTransactions
      .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expense,
      net: income - expense,
      count: filteredAndSortedTransactions.length
    };
  }, [filteredAndSortedTransactions]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Histórico de Transações</CardTitle>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            📋 Histórico Detalhado - Linha por Transação
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Cada linha representa uma transação individual. Serviços principais e adicionais aparecem separadamente.
          </p>
          
          <div className="flex gap-2 text-sm">
            <Badge variant="outline">{filteredStats.count} transações</Badge>
            <Badge className="bg-green-100 text-green-800">
              +{formatCurrency(filteredStats.income)}
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              -{formatCurrency(filteredStats.expense)}
            </Badge>
            <Badge className={`${filteredStats.net >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              ={formatCurrency(filteredStats.net)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
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
              <SelectItem value="income">💰 Receita</SelectItem>
              <SelectItem value="expense">💸 Despesa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="completed">✅ Concluído</SelectItem>
              <SelectItem value="pending">⏳ Pendente</SelectItem>
              <SelectItem value="cancelled">❌ Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
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
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Cliente & Serviço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          {transaction.metadata?.auto_generated && (
                            <div className="flex items-center">
                              🤖 Gerada automaticamente
                            </div>
                          )}
                          {transaction.metadata?.additional && (
                            <div className="flex items-center text-orange-600">
                              ➕ Serviço adicional
                            </div>
                          )}
                          {transaction.appointment_id && (
                            <div className="flex items-center text-blue-600">
                              📋 ID: {transaction.appointment_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
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
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {transaction.metadata && (
                        <div className="text-sm space-y-1">
                          {transaction.metadata.client_name && (
                            <div className="font-medium flex items-center justify-center">
                              <User className="h-3 w-3 mr-1" />
                              {transaction.metadata.client_name}
                            </div>
                          )}
                          {transaction.metadata.service_name && (
                            <div className="text-muted-foreground">
                              {transaction.metadata.service_name}
                            </div>
                          )}
                          <div className="flex justify-center gap-1 mt-1">
                            {transaction.metadata.additional && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                ➕ Adicional
                              </Badge>
                            )}
                            {!transaction.metadata.additional && transaction.metadata.service_name && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                🎯 Principal
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
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
                Receita: +{formatCurrency(filteredStats.income)}
              </span>
              <span className="text-red-600 font-medium">
                Despesa: -{formatCurrency(filteredStats.expense)}
              </span>
              <span className={`font-bold ${filteredStats.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                Líquido: {formatCurrency(filteredStats.net)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;