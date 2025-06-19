
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from './useSupabaseData';

export const useCategoryData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return { success: false, message: 'Erro ao criar categoria' };
      }

      return { success: true, category: data };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, message: 'Erro ao criar categoria' };
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    setCategories
  };
};
