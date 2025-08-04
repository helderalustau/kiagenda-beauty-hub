
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import OpeningHoursManager from './OpeningHoursManager';

interface OpeningHoursCardProps {
  salonId: string;
  initialHours?: any;
}

const OpeningHoursCard = ({ salonId, initialHours }: OpeningHoursCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-green-600" />
          <span>Horários de Funcionamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OpeningHoursManager salonId={salonId} initialHours={initialHours} />
      </CardContent>
    </Card>
  );
};

export default OpeningHoursCard;
