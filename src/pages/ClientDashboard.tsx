import React, { useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { SalonList } from '@/components/SalonList';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

const ClientDashboard = () => {
  const { 
    salons, 
    loading, 
    fetchAllSalons 
  } = useSupabaseData();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchAllSalons();
  }, [user, fetchAllSalons, router]);

  const handleBookService = (salonSlug: string) => {
    router.push(`/booking/${salonSlug}`);
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
