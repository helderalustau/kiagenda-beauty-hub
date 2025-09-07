-- Criar tabela para tokens de push notifications
CREATE TABLE public.push_notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.admin_auth(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  subscription_data JSONB NOT NULL,
  settings JSONB DEFAULT '{
    "enabled": true,
    "newAppointments": true,
    "appointmentUpdates": true,
    "cancelledAppointments": true,
    "silentHours": {
      "enabled": false,
      "start": "22:00",
      "end": "07:00"
    }
  }'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_id, salon_id)
);

-- Enable Row Level Security
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view their own push tokens" 
ON public.push_notification_tokens 
FOR SELECT 
USING (admin_id = auth.uid());

CREATE POLICY "Admins can insert their own push tokens" 
ON public.push_notification_tokens 
FOR INSERT 
WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their own push tokens" 
ON public.push_notification_tokens 
FOR UPDATE 
USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete their own push tokens" 
ON public.push_notification_tokens 
FOR DELETE 
USING (admin_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_push_tokens_updated_at();

-- Index para performance
CREATE INDEX idx_push_tokens_admin_salon ON public.push_notification_tokens(admin_id, salon_id);
CREATE INDEX idx_push_tokens_active ON public.push_notification_tokens(active);

-- Realtime
ALTER TABLE public.push_notification_tokens REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_notification_tokens;