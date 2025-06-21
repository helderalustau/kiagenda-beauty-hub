
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';

export const useSalonFetch = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchedSalonIds, setFetchedSalonIds] = useState<Set<string>>(new Set());

  const fetchSalonData = async (salonId: string) => {
    try {
      // Prevent duplicate fetches for the same salon
      if (fetchedSalonIds.has(salonId) && salon?.id === salonId) {
        console.log('Using cached salon data for:', salonId);
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
        if (error.code === 'PGRST116') {
          console.error('Salon not found:', salonId);
        }
        throw error;
      }

      console.log('Salon data loaded:', data);
      setSalon(data as Salon);
      setFetchedSalonIds(prev => new Set(prev).add(salonId));
    } catch (error) {
      console.error('Error fetching salon data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonBySlug = async (slug: string) => {
    try {
      setLoading(true);
      console.log('Fetching salon by slug:', slug);
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('unique_slug', slug)
        .single();

      if (error) {
        console.error('Error fetching salon by slug:', error);
        throw error;
      }

      console.log('Salon data loaded by slug:', data);
      return data as Salon;
    } catch (error) {
      console.error('Error fetching salon by slug:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSalons = async () => {
    try {
      setLoading(true);
      console.log('Fetching all salons...');
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('setup_completed', true)
        .order('name');

      if (error) {
        console.error('Error fetching salons:', error);
        throw error;
      }

      console.log('All salons loaded:', data?.length || 0, 'salons');
      setSalons(data as Salon[] || []);
      return data as Salon[] || [];
    } catch (error) {
      console.error('Error fetching salons:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    setFetchedSalonIds(new Set());
    setSalon(null);
  };

  return {
    salon,
    salons,
    loading,
    fetchSalonData,
    fetchSalonBySlug,
    fetchAllSalons,
    setSalon,
    setSalons,
    clearCache
  };
};
