
import React from 'react';
import SuperAdminSalonManager from '@/components/SuperAdminSalonManager';
import SuperAdminCreateSalonDialog from '@/components/SuperAdminCreateSalonDialog';
import { Salon } from '@/hooks/useSupabaseData';

interface SuperAdminSalonsTabProps {
  salons: Salon[];
  loading: boolean;
  onRefresh: () => void;
  onCreateSalon: (salonData: any, bannerFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const SuperAdminSalonsTab = ({ 
  salons, 
  loading, 
  onRefresh, 
  onCreateSalon, 
  isSubmitting 
}: SuperAdminSalonsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Estabelecimentos
          </h2>
          <p className="text-lg text-gray-600">
            Gerencie todos os estabelecimentos cadastrados no sistema
          </p>
        </div>

        <SuperAdminCreateSalonDialog
          onCreateSalon={onCreateSalon}
          isSubmitting={isSubmitting}
        />
      </div>

      <SuperAdminSalonManager 
        salons={salons} 
        loading={loading} 
        onRefresh={onRefresh} 
      />
    </div>
  );
};

export default SuperAdminSalonsTab;
