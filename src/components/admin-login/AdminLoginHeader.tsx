import React from 'react';
import { Scissors, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
export const AdminLoginHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Kiagenda - Loja</h1>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>
    </div>
  );
};