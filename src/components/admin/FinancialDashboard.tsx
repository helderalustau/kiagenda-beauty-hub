import React from 'react';
import { Appointment } from '@/types/supabase-entities';
import MultiSalonFinancialDashboard from './MultiSalonFinancialDashboard';

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

  return <MultiSalonFinancialDashboard currentSalonId={salonId} />;
};

export default FinancialDashboard;