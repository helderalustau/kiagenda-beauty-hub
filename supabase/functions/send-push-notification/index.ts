import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  adminId?: string;
  salonId?: string;
  title: string;
  body: string;
  data?: {
    type: string;
    url?: string;
    appointmentId?: string;
    [key: string]: any;
  };
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { adminId, salonId, title, body, data } = await req.json() as PushNotificationRequest;

    console.log('Processing push notification request:', { adminId, salonId, title });

    // Build query to get push tokens
    let query = supabase
      .from('push_notification_tokens')
      .select('subscription_data, settings')
      .eq('active', true);

    // Filter by admin or salon
    if (adminId) {
      query = query.eq('admin_id', adminId);
    } else if (salonId) {
      query = query.eq('salon_id', salonId);
    } else {
      throw new Error('Either adminId or salonId must be provided');
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active push tokens found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokens.length} active push tokens`);

    // Check if we should send notifications (silent hours, settings, etc.)
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    let sentCount = 0;
    const sendPromises = tokens.map(async (tokenData) => {
      try {
        const settings = tokenData.settings as any;
        const subscription = tokenData.subscription_data as PushSubscription;

        // Check notification type settings
        if (data?.type === 'new_appointment' && !settings?.newAppointments) {
          console.log('Skipping notification - new appointments disabled');
          return;
        }
        if (data?.type === 'appointment_update' && !settings?.appointmentUpdates) {
          console.log('Skipping notification - appointment updates disabled');
          return;
        }
        if (data?.type === 'appointment_cancelled' && !settings?.cancelledAppointments) {
          console.log('Skipping notification - cancelled appointments disabled');
          return;
        }

        // Check silent hours
        if (settings?.silentHours?.enabled) {
          const startTime = settings.silentHours.start;
          const endTime = settings.silentHours.end;
          
          if (startTime && endTime) {
            const isInSilentHours = (startTime <= endTime) 
              ? (currentTime >= startTime && currentTime <= endTime)
              : (currentTime >= startTime || currentTime <= endTime);
            
            if (isInSilentHours) {
              console.log('Skipping notification - silent hours active');
              return;
            }
          }
        }

        // Prepare notification payload
        const notificationPayload = {
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            url: data?.url || '/admin',
            timestamp: Date.now(),
            ...data
          },
          actions: data?.type === 'new_appointment' ? [
            {
              action: 'view',
              title: 'Ver Agendamento',
              icon: '/icons/icon-72x72.png'
            }
          ] : undefined,
          requireInteraction: true,
          vibrate: [200, 100, 200]
        };

        // VAPID details - você deve configurar essas chaves
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NE_9gDwU0mw9VqxtlSRoMiHDk-jG8Z5OdKiUJpR4zJ-2eO4zY8x_Vo';
        const vapidPrivateKey = 'YOUR_VAPID_PRIVATE_KEY'; // Configure isso nas variáveis de ambiente
        
        // Para este exemplo, vamos usar uma implementação básica
        // Em produção, você deve usar uma biblioteca como 'web-push'
        
        const webPushHeaders = {
          'TTL': '86400',
          'Content-Type': 'application/json',
          'Authorization': `WebPush ${vapidPrivateKey}`, // Simplifcado para exemplo
        };

        // Enviar push notification
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: webPushHeaders,
          body: JSON.stringify(notificationPayload)
        });

        if (response.ok) {
          sentCount++;
          console.log('Push notification sent successfully');
        } else {
          console.error('Failed to send push notification:', response.status, response.statusText);
        }

      } catch (error) {
        console.error('Error sending individual push notification:', error);
      }
    });

    await Promise.allSettled(sendPromises);

    console.log(`Push notifications sent: ${sentCount}/${tokens.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: tokens.length,
        message: `Sent ${sentCount} notifications`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});