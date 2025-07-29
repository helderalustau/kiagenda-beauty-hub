
import React from 'react';
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">
          SalonPro
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
            Recursos
          </a>
          <a href="#plans" className="text-gray-600 hover:text-blue-600 transition-colors">
            Planos
          </a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
            Contato
          </a>
        </nav>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
            Entrar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Cadastrar
          </Button>
        </div>
      </div>
    </header>
  );
};
