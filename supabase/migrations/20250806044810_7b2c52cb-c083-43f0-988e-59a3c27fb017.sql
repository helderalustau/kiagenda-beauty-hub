-- Update all confirmed appointments to completed for the salon
UPDATE public.appointments 
SET 
  status = 'completed',
  updated_at = now()
WHERE 
  salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008' 
  AND status = 'confirmed' 
  AND deleted_at IS NULL;

-- Return the count of updated records
SELECT COUNT(*) as updated_appointments 
FROM public.appointments 
WHERE 
  salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008' 
  AND status = 'completed' 
  AND updated_at > (now() - INTERVAL '1 minute');