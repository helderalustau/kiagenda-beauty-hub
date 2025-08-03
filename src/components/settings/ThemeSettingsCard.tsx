
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";

const ThemeSettingsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Personalização</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Personalização Avançada
          </h3>
          <p className="text-gray-600 mb-4">
            Personalize cores, temas e layout do seu estabelecimento
          </p>
          <Badge variant="secondary" className="mb-2">
            Em Breve
          </Badge>
          <p className="text-sm text-gray-500">
            Esta funcionalidade estará disponível em futuras atualizações
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettingsCard;
