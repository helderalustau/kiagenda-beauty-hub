
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";

const BookingPageHeader = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/client-dashboard');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                BeautyFlow
              </h1>
              <p className="text-sm text-gray-600">Agendamento</p>
            </div>
          </div>
          
          <Button 
            onClick={handleBackToDashboard}
            variant="outline" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPageHeader;
