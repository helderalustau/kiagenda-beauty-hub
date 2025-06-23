
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface ClosedSalonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
}

const ClosedSalonDialog = ({ isOpen, onClose, salon }: ClosedSalonDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-red-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Estabelecimento Fechado
          </DialogTitle>
          <DialogDescription className="text-center">
            {salon.name} não está aceitando agendamentos no momento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} variant="outline">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClosedSalonDialog;
