
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BookingErrorStateProps {
  error: string;
}

const BookingErrorState = ({ error }: BookingErrorStateProps) => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/client-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error}
          </h2>
          <p className="text-gray-600 mb-4">
            O estabelecimento que você está tentando acessar não foi encontrado ou não está disponível.
          </p>
          <Button onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Estabelecimentos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingErrorState;
