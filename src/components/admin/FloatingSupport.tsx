
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

const FloatingSupport = () => {
  const [supportPhone, setSupportPhone] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Buscar número do super admin das configurações
    // Por enquanto vamos usar um número padrão
    setSupportPhone('5548999999999'); // Exemplo
  }, []);

  const openWhatsApp = () => {
    if (supportPhone) {
      const message = encodeURIComponent('Olá, preciso de suporte');
      const url = `https://whatsa.me/${supportPhone}/?t=${message}`;
      window.open(url, '_blank');
    }
  };

  if (!isVisible || !supportPhone) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          onClick={openWhatsApp}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-black text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Suporte via WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>

        {/* Botão de fechar */}
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-500 hover:bg-gray-600 text-white p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default FloatingSupport;
