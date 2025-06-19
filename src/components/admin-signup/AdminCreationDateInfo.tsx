
import React from 'react';
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { getCurrentDateTime } from '@/utils/adminFormValidation';

const AdminCreationDateInfo = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-xl border border-blue-100">
      <div className="flex items-center gap-3 mb-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <Label className="text-sm font-semibold text-blue-800">
          Data de Criação da Conta
        </Label>
      </div>
      <p className="text-blue-700 font-mono text-sm bg-white/60 px-3 py-2 rounded-lg">
        {getCurrentDateTime()}
      </p>
    </div>
  );
};

export default AdminCreationDateInfo;
