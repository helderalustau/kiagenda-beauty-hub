
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import SalonUsersManager from './SalonUsersManager';

interface SalonUsersCardProps {
  salonId: string;
  maxUsers: number;
}

const SalonUsersCard = ({ salonId, maxUsers }: SalonUsersCardProps) => {
  const handleUpgrade = () => {
    console.log('Upgrade plan requested');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-purple-600" />
          <span>Gerenciamento de Usuários</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SalonUsersManager 
          salonId={salonId} 
          maxUsers={maxUsers}
          onUpgrade={handleUpgrade}
        />
      </CardContent>
    </Card>
  );
};

export default SalonUsersCard;
