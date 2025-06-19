
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Phone, Crown, Edit, Trash2, Settings } from "lucide-react";
import { Salon, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SuperAdminSalonManagerProps {
  salons: Salon[];
  loading: boolean;
  onRefresh: () => void;
}

const SuperAdminSalonManager = ({ salons, loading, onRefresh }: SuperAdminSalonManagerProps) => {
  const { updateSalon, deleteSalon } = useSupabaseData();
  const { toast } = useToast();

  const handlePlanChange = async (salonId: string, newPlan: 'bronze' | 'prata' | 'gold') => {
    const result = await updateSalon({ id: salonId, plan: newPlan });
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso!"
      });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteSalon = async (salonId: string) => {
    const result = await deleteSalon(salonId);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Estabelecimento excluído com sucesso!"
      });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estabelecimento</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Plano Atual</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salons.map((salon) => (
              <TableRow key={salon.id}>
                <TableCell>
                  <div>
                    <div className="font-semibold text-gray-900">{salon.name}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {salon.address}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-900">{salon.owner_name}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Badge className={`${getPlanColor(salon.plan)} flex items-center w-fit`}>
                      <Crown className="h-3 w-3 mr-1" />
                      {getPlanName(salon.plan)}
                    </Badge>
                    <Select 
                      value={salon.plan} 
                      onValueChange={(value: 'bronze' | 'prata' | 'gold') => 
                        handlePlanChange(salon.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="prata">Prata</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {salon.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        localStorage.setItem('selectedSalonId', salon.id);
                        window.location.href = '/admin-dashboard';
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Gerenciar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o estabelecimento "{salon.name}"? 
                            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSalon(salon.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SuperAdminSalonManager;
