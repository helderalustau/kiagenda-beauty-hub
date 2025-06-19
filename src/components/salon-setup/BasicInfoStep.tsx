
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Building, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface BasicInfoStepProps {
  salon: Salon | null;
}

const BasicInfoStep = ({ salon }: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Bem-vindo à Configuração do seu Estabelecimento!
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Vamos configurar as informações do seu estabelecimento em algumas etapas simples. 
            Isso ajudará seus clientes a encontrarem e agendarem serviços com você.
          </p>
        </div>
      </div>

      {salon && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-800">Estabelecimento Criado</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Código Temporário:</strong> {salon.name}</p>
              <p><strong>Responsável:</strong> {salon.owner_name}</p>
              <p><strong>Telefone:</strong> {salon.phone}</p>
              <p><strong>Plano:</strong> {salon.plan.charAt(0).toUpperCase() + salon.plan.slice(1)}</p>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-800">
                <Clock className="h-4 w-4 inline mr-1" />
                Agora vamos personalizar as informações do seu estabelecimento para que seus clientes possam encontrá-lo facilmente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h4 className="font-semibold text-gray-800">Informações Básicas</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Nome do estabelecimento e categoria de serviços
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <h4 className="font-semibold text-gray-800">Endereço</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Localização para seus clientes encontrarem você
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <h4 className="font-semibold text-gray-800">Contato</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Telefone para contato e agendamentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <h4 className="font-semibold text-gray-800">Horários & Serviços</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Horários de funcionamento e serviços oferecidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <span className="text-sm font-medium">Vamos começar</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
