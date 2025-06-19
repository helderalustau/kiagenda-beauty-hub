
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users, DollarSign, Crown } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SuperAdminHeaderProps {
  salon: Salon | null;
  totalClients?: number;
  monthlyRevenue?: number;
  onBack: () => void;
}

const SuperAdminHeader = ({ salon, totalClients = 0, monthlyRevenue = 0, onBack }: SuperAdminHeaderProps) => {
  if (!salon) return null;

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'prata': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'Bronze';
      case 'prata': return 'Prata';
      case 'gold': return 'Gold';
      default: return 'Bronze';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'R$ 29,90/mês';
      case 'prata': return 'R$ 59,90/mês';
      case 'gold': return 'R$ 99,90/mês';
      default: return 'R$ 29,90/mês';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular próximo vencimento (30 dias após cadastro)
  const getNextDueDate = (createdAt: string) => {
    const created = new Date(createdAt);
    const nextDue = new Date(created);
    nextDue.setMonth(nextDue.getMonth() + 1);
    return nextDue.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
          
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            Super Administrador
          </Badge>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-pink-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{salon.name}</h1>
                <p className="text-gray-600">Proprietário: {salon.owner_name}</p>
              </div>
              
              <Badge className={`${getPlanColor(salon.plan)} flex items-center`}>
                <Crown className="h-3 w-3 mr-1" />
                {getPlanName(salon.plan)}
              </Badge>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Data de Cadastro</p>
                  <p className="font-semibold text-gray-900">{formatDate(salon.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Próximo Vencimento</p>
                  <p className="font-semibold text-gray-900">{getNextDueDate(salon.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total de Clientes</p>
                  <p className="font-semibold text-gray-900">{totalClients}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Faturamento Mensal</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(monthlyRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Plano: {getPlanName(salon.plan)} - {getPlanPrice(salon.plan)}</span>
              <span>Máximo de atendentes: {salon.max_attendants}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminHeader;
