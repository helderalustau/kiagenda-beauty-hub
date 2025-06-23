
import React from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface OptimizedBookingHeaderProps {
  salon: Salon;
  isSubmitting: boolean;
}

const OptimizedBookingHeader = ({ salon, isSubmitting }: OptimizedBookingHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
          Solicitar Agendamento
        </DialogTitle>
        <DialogDescription className="text-blue-100">
          {salon.name} - {salon.address}
        </DialogDescription>
      </DialogHeader>
    </div>
  );
};

export default OptimizedBookingHeader;
