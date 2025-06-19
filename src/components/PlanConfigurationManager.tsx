
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, X } from "lucide-react";
import { PlanConfiguration, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface PlanConfigurationManagerProps {
  configurations: PlanConfiguration[];
  onRefresh: () => void;
}

const PlanConfigurationManager = ({ configurations, onRefresh }: PlanConfigurationManagerProps) => {
  const { updatePlanConfiguration } = useSupabaseData();
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PlanConfiguration>>({});

  const handleEdit = (plan: PlanConfiguration) => {
    setEditingPlan(plan.id);
    setEditData({
      name: plan.name,
      price: plan.price,
      description: plan.description
    });
  };

  const handleSave = async (planId: string) => {
    const result = await updatePlanConfiguration(planId, editData);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Configuração do plano atualizada com sucesso!"
      });
      setEditingPlan(null);
      setEditData({});
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditData({});
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'bronze': return 'from-amber-50 to-amber-100 border-amber-200';
      case 'prata': return 'from-gray-50 to-gray-100 border-gray-200';
      case 'gold': return 'from-yellow-50 to-yellow-100 border-yellow-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {configurations.map((plan) => (
        <Card key={plan.id} className={`bg-gradient-to-br ${getPlanColor(plan.plan_type)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {editingPlan === plan.id ? (
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="font-bold"
                  />
                ) : (
                  plan.name
                )}
              </CardTitle>
              {editingPlan === plan.id ? (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    onClick={() => handleSave(plan.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
            <CardDescription className="capitalize">
              Plano {plan.plan_type}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Preço</Label>
                {editingPlan === plan.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.price || ''}
                    onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                    className="font-bold text-lg"
                  />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(plan.price)}</div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                {editingPlan === plan.id ? (
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlanConfigurationManager;
