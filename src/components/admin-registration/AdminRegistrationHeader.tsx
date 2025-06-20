
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

const AdminRegistrationHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Criar Novo Administrador
      </CardTitle>
      <CardDescription>
        Preencha os dados do novo administrador. Após a criação, você será direcionado para seleção de plano e configuração do estabelecimento.
      </CardDescription>
    </CardHeader>
  );
};

export default AdminRegistrationHeader;
