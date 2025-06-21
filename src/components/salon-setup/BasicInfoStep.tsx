
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Store, Calendar, Users, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Salon } from '@/hooks/useSupabaseData';

interface BasicInfoStepProps {
  salon: Salon | null;
}

const BasicInfoStep = ({ salon }: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Store className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Bem-vindo ao BeautyFlow!
        </h3>
        <p className="text-gray-600">
          Complete as informações para começar a receber agendamentos
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <CardContent className="pt-4">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Agendamentos Online</h4>
            <p className="text-sm text-gray-600">
              Permita que clientes agendem serviços 24 horas por dia
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-4">
          <CardContent className="pt-4">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Gestão de Clientes</h4>
            <p className="text-sm text-gray-600">
              Mantenha histórico completo de seus clientes
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-4">
          <CardContent className="pt-4">
            <Smartphone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Acesso Mobile</h4>
            <p className="text-sm text-gray-600">
              Gerencie seu negócio de qualquer lugar
            </p>
          </CardContent>
        </Card>
      </div>

      {salon && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Estabelecimento: {salon.name}</h4>
                <p className="text-sm text-blue-700">ID: {salon.id}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {salon.plan.charAt(0).toUpperCase() + salon.plan.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BasicInfoStep;
