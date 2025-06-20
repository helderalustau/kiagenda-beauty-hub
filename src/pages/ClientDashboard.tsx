
import React, { useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SalonList from '@/components/SalonList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ClientDashboard = () => {
  const { 
    salons, 
    loading, 
    fetchAllSalons 
  } = useSupabaseData();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchAllSalons();
  }, [user, fetchAllSalons, navigate]);

  const handleBookService = async (salon: any) => {
    navigate(`/booking/${salon.unique_slug || salon.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando estabelecimentos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Bem-vindo(a) ao Painel do Cliente
      </h1>
      
      {salons.length > 0 ? (
          <SalonList 
            salons={salons} 
            onBookService={handleBookService}
          />
        ) : (
          <p>Nenhum estabelecimento cadastrado ainda.</p>
        )}
    </div>
  );
};

export default ClientDashboard;
