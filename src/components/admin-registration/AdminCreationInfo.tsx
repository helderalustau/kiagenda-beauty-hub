
import React from 'react';
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

const AdminCreationInfo = () => {
  const getCurrentDateTime = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-gray-600" />
        <Label className="text-sm font-medium text-gray-600">
          Data de Criação
        </Label>
      </div>
      <p className="text-sm text-gray-800 font-mono">
        {getCurrentDateTime()}
      </p>
    </div>
  );
};

export default AdminCreationInfo;
