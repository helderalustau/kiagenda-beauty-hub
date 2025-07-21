
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Crown, Calendar, Users, Settings } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SalonViewModalProps {
  salon: Salon | null;
  isOpen: boolean;
  onClose: () => void;
}

const SalonViewModal = ({ salon, isOpen, onClose }: SalonViewModalProps) => {
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

  const handleManageSalon = () => {
    localStorage.setItem('selectedSalonId', salon.id);
    window.location.href = '/admin-dashboard';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Detalhes do Estabelecimento
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o estabelecimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome do Estabelecimento</label>
                  <p className="text-lg font-semibold">{salon.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Proprietário</label>
                  <p className="text-lg">{salon.owner_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Plano Atual</label>
                  <Badge className={`${getPlanColor(salon.plan)} flex items-center w-fit mt-1`}>
                    <Crown className="h-3 w-3 mr-1" />
                    {getPlanName(salon.plan)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    {salon.setup_completed ? (
                      <Badge variant="outline" className="text-green-600 bg-green-50">
                        Setup Completo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 bg-orange-50">
                        Setup Pendente
                      </Badge>
                    )}
                    {salon.is_open ? (
                      <Badge variant="outline" className="ml-2 text-green-600 bg-green-50">
                        Aberto
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 text-red-600 bg-red-50">
                        Fechado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone Principal
                </label>
                <p className="text-lg">{salon.phone}</p>
              </div>
              
              {salon.contact_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Telefone de Contato
                  </label>
                  <p className="text-lg">{salon.contact_phone}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Endereço
                </label>
                <p className="text-lg">{salon.address}</p>
                {salon.city && salon.state && (
                  <p className="text-sm text-gray-600">
                    {salon.city}, {salon.state}
                    {salon.street_number && ` - Nº ${salon.street_number}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Criado em</label>
                  <p className="text-lg">
                    {new Date(salon.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Última atualização</label>
                  <p className="text-lg">
                    {new Date(salon.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {salon.unique_slug && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Link único</label>
                  <p className="text-sm text-blue-600 break-all">
                    /booking/{salon.unique_slug}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleManageSalon}>
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Estabelecimento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalonViewModal;
