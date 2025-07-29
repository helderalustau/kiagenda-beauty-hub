import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { useNavigate } from 'react-router-dom';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Index = () => {
  const { getAllPlansInfo, loading, error } = usePlanConfigurations();
  const [availablePlans, setAvailablePlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !error) {
      const plans = getAllPlansInfo();
      setAvailablePlans(plans);
    }
  }, [getAllPlansInfo, loading, error]);

  const handlePlanSelection = (planType: string) => {
    // Navegar para cadastro de administrador com plano pré-selecionado
    navigate('/admin-signup', { 
      state: { selectedPlan: planType }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <SecurityHeaders />

      {/* Header Section */}
      <Header />

      {/* Hero Section */}
      <section className="py-24 px-4 text-center bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Gerencie seu negócio de beleza com facilidade
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Simplifique agendamentos, gerencie clientes e impulsione seu sucesso.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg">
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Escolha o Plano Ideal
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Selecione o plano que melhor atende às necessidades do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {availablePlans.map((plan, index) => (
              <Card 
                key={plan.plan_type} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  index === 1 ? 'border-blue-500 shadow-lg scale-105' : 'hover:border-blue-300'
                }`}
              >
                {index === 1 && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    MAIS POPULAR
                  </div>
                )}
                
                <CardContent className={`p-8 ${index === 1 ? 'pt-16' : ''}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {plan.price}
                    </div>
                    <p className="text-gray-500 text-sm">por mês</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handlePlanSelection(plan.plan_type)}
                    className={`w-full ${
                      index === 1 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-semibold py-3 rounded-lg transition-all duration-300`}
                  >
                    Começar com {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Não tem certeza de qual plano escolher?
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin-signup')}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Começar com Plano Bronze
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Index;
