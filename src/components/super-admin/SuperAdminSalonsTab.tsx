
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuperAdminSalonManager from '@/components/SuperAdminSalonManager';
import SuperAdminCreateSalonDialog from '@/components/SuperAdminCreateSalonDialog';
import SalonFilters from './salon-management/SalonFilters';
import { Salon } from '@/hooks/useSupabaseData';
import { Crown, Store, TrendingUp, AlertCircle } from "lucide-react";

interface SuperAdminSalonsTabProps {
  salons: Salon[];
  loading: boolean;
  onRefresh: () => void;
  onCreateSalon: (salonData: any, bannerFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const SuperAdminSalonsTab = ({ 
  salons, 
  loading, 
  onRefresh, 
  onCreateSalon, 
  isSubmitting 
}: SuperAdminSalonsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>(salons);

  // Memoized values for performance
  const availableStates = useMemo(() => {
    const states = [...new Set(salons.map(salon => salon.state).filter(Boolean))];
    return states.sort();
  }, [salons]);

  const salonStats = useMemo(() => {
    const total = salons.length;
    const active = salons.filter(s => s.is_open && s.setup_completed).length;
    const setupPending = salons.filter(s => !s.setup_completed).length;
    const inactive = salons.filter(s => !s.is_open && s.setup_completed).length;
    
    const planStats = {
      bronze: salons.filter(s => s.plan === 'bronze').length,
      prata: salons.filter(s => s.plan === 'prata').length,
      gold: salons.filter(s => s.plan === 'gold').length
    };

    // Calcular crescimento dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSalons = salons.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length;

    return {
      total,
      active,
      setupPending,
      inactive,
      planStats,
      recentSalons
    };
  }, [salons]);

  useEffect(() => {
    let filtered = salons;

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(salon =>
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.phone.includes(searchTerm)
      );
    }

    // Filtro por plano
    if (planFilter !== 'all') {
      filtered = filtered.filter(salon => salon.plan === planFilter);
    }

    // Filtro por estado
    if (stateFilter !== 'all') {
      filtered = filtered.filter(salon => salon.state === stateFilter);
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(salon => salon.is_open && salon.setup_completed);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(salon => !salon.is_open && salon.setup_completed);
      } else if (statusFilter === 'setup_pending') {
        filtered = filtered.filter(salon => !salon.setup_completed);
      }
    }

    setFilteredSalons(filtered);
  }, [searchTerm, planFilter, stateFilter, statusFilter, salons]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gestão de Estabelecimentos
          </h2>
          <p className="text-lg text-gray-600">
            Gerencie todos os estabelecimentos cadastrados no sistema
          </p>
        </div>

        <SuperAdminCreateSalonDialog
          onCreateSalon={onCreateSalon}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Estabelecimentos</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{salonStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {salonStats.recentSalons} novos nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estabelecimentos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{salonStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {salonStats.total > 0 ? Math.round((salonStats.active / salonStats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setup Pendente</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{salonStats.setupPending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando configuração
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Gold</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{salonStats.planStats.gold}</div>
            <p className="text-xs text-muted-foreground">
              {salonStats.planStats.prata} Prata, {salonStats.planStats.bronze} Bronze
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SalonFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        availableStates={availableStates}
      />

      {/* Results Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600">
            Mostrando {filteredSalons.length} de {salons.length} estabelecimentos
            {(searchTerm || planFilter !== 'all' || stateFilter !== 'all' || statusFilter !== 'all') && (
              <span className="ml-2 text-blue-600">
                (filtros aplicados)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <SuperAdminSalonManager 
        salons={filteredSalons} 
        loading={loading} 
        onRefresh={onRefresh} 
      />
    </div>
  );
};

export default SuperAdminSalonsTab;
