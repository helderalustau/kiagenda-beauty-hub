
import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">SalonPro</h3>
            <p className="text-gray-300 text-sm">
              A solução completa para gestão de salões de beleza.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Recursos</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Preços</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Ajuda</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Termos</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 SalonPro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
