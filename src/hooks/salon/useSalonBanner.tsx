
import { supabase } from '@/integrations/supabase/client';

export const useSalonBanner = () => {
  const uploadSalonBanner = async (file: File, salonId: string) => {
    try {
      console.log('Starting banner upload for salon:', salonId);
      
      // Ensure the bucket exists first
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      if (bucketListError) {
        console.error('Error listing buckets:', bucketListError);
      } else {
        console.log('Available buckets:', buckets);
        const salonAssetsBucket = buckets?.find(bucket => bucket.name === 'salon-assets');
        if (!salonAssetsBucket) {
          console.warn('salon-assets bucket not found, upload may fail');
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${salonId}-${Math.random()}.${fileExt}`;
      const filePath = `salon-banners/${fileName}`;

      console.log('Uploading file to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('salon-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        return { success: false, message: `Erro ao fazer upload da imagem: ${uploadError.message}` };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      const { data, error } = await supabase
        .from('salons')
        .update({ banner_image_url: publicUrl })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error updating salon banner:', error);
        return { success: false, message: 'Erro ao atualizar banner' };
      }

      console.log('Banner updated successfully');
      return { success: true, salon: data };
    } catch (error) {
      console.error('Unexpected error uploading salon banner:', error);
      return { success: false, message: 'Erro inesperado ao fazer upload' };
    }
  };

  return {
    uploadSalonBanner
  };
};
