
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

const AdminSignupHeader = () => {
  return (
    <CardHeader className="text-center space-y-4 pb-6">
      <div className="mx-auto bg-gradient-to-r from-blue-600 to-pink-500 p-3 rounded-full w-16 h-16 flex items-center justify-center">
        <Shield className="h-8 w-8 text-white" />
      </div>
      <div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
          Criar Conta Administrativa
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          Complete o cadastro para acessar o painel administrativo
        </CardDescription>
      </div>
    </CardHeader>
  );
};

export default AdminSignupHeader;
