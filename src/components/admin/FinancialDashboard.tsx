import React from 'react';
import { Appointment } from '@/types/supabase-entities';
import DirectFinancialDashboard from './DirectFinancialDashboard';

interface FinancialDashboardProps {
  appointments: Appointment[];
}

const FinancialDashboard = ({ appointments }: FinancialDashboardProps) => {
  // Get salon ID for financial data
  const getSalonId = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        return admin.salon_id;
      } catch (error) {
        console.error('Error parsing adminAuth:', error);
      }
    }
    return '';
  };

  const salonId = getSalonId();

  if (!salonId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">⚠️ Erro</div>
          <div>Não foi possível identificar o salão</div>
        </div>
      </div>
    );
  }

  return <DirectFinancialDashboard salonId={salonId} />;
};

export default FinancialDashboard;