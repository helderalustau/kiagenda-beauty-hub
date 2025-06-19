
import React from 'react';
import { MapPin } from "lucide-react";

const AdminInfoSection = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Informações da Conta
      </h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Sua conta será criada com as informações fornecidas</li>
        <li>• Você receberá acesso ao painel administrativo</li>
        <li>• A data de criação será registrada automaticamente</li>
        <li>• Todos os dados são protegidos e criptografados</li>
      </ul>
    </div>
  );
};

export default AdminInfoSection;
