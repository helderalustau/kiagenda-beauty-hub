
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '../useSupabaseData';

export const useSalonFetch = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSalonData = async (salonId: string) => {
    try {
      // Check if we already have the data in cache
      if (salon && salon.id === salonId) {
        console.log('Using cached salon data');
        return;
      }

      setLoading(true);
      console.log('Fetching salon data:', salonId);
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) {
        console.error('Error fetching salon:', error);
        return;
      }

      console.log('Salon data loaded:', data);
      setSalon(data as Salon);
    } catch (error) {
      console.error('Error fetching salon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonBySlug = async (slug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('unique_slug', slug)
        .single();

      if (error) {
        console.error('Error fetching salon by slug:', error);
        return null;
      }

      return data as Salon;
    } catch (error) {
      console.error('Error fetching salon by slug:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSalons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching salons:', error);
        return;
      }

      setSalons(data as Salon[] || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    salon,
    salons,
    loading,
    fetchSalonData,
    fetchSalonBySlug,
    fetchAllSalons,
    setSalon,
    setSalons
  };
};
