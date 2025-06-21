
import React from 'react';
import { Scissors } from "lucide-react";

export const AdminLoginHeader = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              BeautyFlow - Loja
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
