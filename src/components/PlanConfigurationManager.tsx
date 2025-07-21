import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Edit, X, Check, AlertCircle, DollarSign } from "lucide-react";
import { useSupabaseData, PlanConfiguration } from '@/hooks/useSupabaseData';
import { useToast } from "@/hooks/use-toast";

type Props = {
  configurations: PlanConfiguration[];
  onRefresh: () => Promise<void>;
};

interface EditingPlan extends PlanConfiguration {
  max_appointments?: number;
  max_attendants?: number;
}

const PlanConfigurationManager: React.FC<Props> = ({ configurations, onRefresh }) => {
  const { updatePlanConfiguration } = useSupabaseData();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<EditingPlan | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  console.log('PlanConfigurationManager received configurations:', configurations);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (plan: PlanConfiguration) => {
    setEditingId(plan.id);
    setEditingPlan({
      ...plan,
      max_appointments: (plan as any).max_appointments || 50,
      max_attendants: (plan as any).max_attendants || 1
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingPlan(null);
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    setIsUpdating(true);
    
    try {
      const result = await updatePlanConfiguration({
        planData: {
          id: editingPlan.id,
          name: editingPlan.name,
          plan_type: editingPlan.plan_type,
          price: editingPlan.price,
          max_users: editingPlan.max_users,
          max_appointments: editingPlan.max_appointments,
          max_attendants: editingPlan.max_attendants,
          description: editingPlan.description
        }
      });

      if (result.success) {
        toast({
          title: "✅ Plano Atualizado",
          description: `Configurações do plano ${editingPlan.name} atualizadas com sucesso!`
        });
        handleCancel();
        await onRefresh();
      } else {
        toast({
          title: "❌ Erro ao Atualizar",
          description: result.message || "Erro ao atualizar configuração",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "❌ Erro Inesperado",
        description: "Erro inesperado ao atualizar plano",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (field: keyof EditingPlan, value: any) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      [field]: value
    });
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'prata': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">💰 Gerenciar Preços dos Planos</h1>
        <p className="text-lg text-gray-600 mb-6">
          Configure valores, limites e recursos de cada plano de assinatura
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">⚠️ Impacto Global</h3>
                <p className="text-sm text-amber-700">
                  Alterações serão aplicadas automaticamente para todos os estabelecimentos que utilizam esses planos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">💡 Como Funciona</h3>
                <p className="text-sm text-blue-700">
                  Novos valores entram em vigor imediatamente. Use o botão de edição para modificar cada plano.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-xl">📊 Configurações dos Planos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Plano</TableHead>
                  <TableHead className="font-semibold">Preço/Mês</TableHead>
                  <TableHead className="font-semibold">Máx. Usuários</TableHead>
                  <TableHead className="font-semibold">Máx. Atendentes</TableHead>
                  <TableHead className="font-semibold">Máx. Agendamentos</TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                  <TableHead className="font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations?.map((plan) => {
                  const isEditing = editingId === plan.id;
                  const currentPlan = isEditing ? editingPlan : plan;
                  
                  return (
                    <TableRow key={plan.id} className={isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      {/* Nome do Plano */}
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getPlanColor(plan.plan_type)} font-semibold`}>
                            {plan.name}
                          </Badge>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {plan.plan_type}
                          </span>
                        </div>
                      </TableCell>

                      {/* Preço */}
                      <TableCell>
                        {isEditing ? (
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentPlan?.price || 0}
                              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                              className="pl-8 font-semibold"
                              disabled={isUpdating}
                            />
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(Number(plan.price))}
                          </div>
                        )}
                      </TableCell>

                      {/* Máx. Usuários */}
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={currentPlan?.max_users || 1}
                            onChange={(e) => handleChange('max_users', parseInt(e.target.value) || 1)}
                            className="w-20"
                            disabled={isUpdating}
                          />
                        ) : (
                          <span className="font-semibold">{plan.max_users}</span>
                        )}
                      </TableCell>

                      {/* Máx. Atendentes */}
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={currentPlan?.max_attendants || 1}
                            onChange={(e) => handleChange('max_attendants', parseInt(e.target.value) || 1)}
                            className="w-20"
                            disabled={isUpdating}
                          />
                        ) : (
                          <span className="font-semibold">{(plan as any).max_attendants || 1}</span>
                        )}
                      </TableCell>

                      {/* Máx. Agendamentos */}
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={currentPlan?.max_appointments || 50}
                            onChange={(e) => handleChange('max_appointments', parseInt(e.target.value) || 50)}
                            className="w-24"
                            disabled={isUpdating}
                          />
                        ) : (
                          <span className="font-semibold">{(plan as any).max_appointments || 50}</span>
                        )}
                      </TableCell>

                      {/* Descrição */}
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={currentPlan?.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Descrição do plano..."
                            className="w-48"
                            disabled={isUpdating}
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{plan.description}</span>
                        )}
                      </TableCell>

                      {/* Ações */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(plan)}
                              disabled={editingId !== null}
                              className="border-primary text-primary hover:bg-primary hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {(!configurations || configurations.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum plano configurado
            </h3>
            <p className="text-gray-600">
              Não foram encontradas configurações de planos no sistema.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Status do Sistema */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <p className="text-sm text-green-800">
              <strong>Sistema Ativo:</strong> Todas as alterações são aplicadas em tempo real
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanConfigurationManager;