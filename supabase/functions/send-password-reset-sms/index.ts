import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetSMSRequest {
  phone: string;
  userType: 'admin' | 'client';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, userType }: PasswordResetSMSRequest = await req.json();
    
    console.log(`🔄 Solicitação de reset de senha via SMS para ${userType}:`, phone);

    // Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se o usuário existe na tabela correspondente
    const tableName = userType === 'admin' ? 'admin_auth' : 'client_auth';
    const { data: userData, error: searchError } = await supabase
      .from(tableName)
      .select('id, name, phone')
      .eq('phone', phone)
      .single();

    if (searchError || !userData) {
      console.error(`❌ ${userType} não encontrado:`, searchError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Telefone não encontrado no sistema de ${userType === 'admin' ? 'administradores' : 'clientes'}`
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Gerar código de verificação de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 600000); // 10 minutos

    console.log(`📱 Código de verificação gerado: ${verificationCode}`);

    // Aqui você integraria com um serviço de SMS como Twilio, WhatsApp Business API, etc.
    // Por enquanto, vamos simular o envio e logar o código
    
    // Simulação de envio de SMS
    const smsMessage = `Seu código de recuperação de senha é: ${verificationCode}. Válido por 10 minutos. Não compartilhe este código.`;
    
    console.log(`📱 SMS enviado para ${phone}:`, smsMessage);

    // Em um ambiente real, você salvaria o código em uma tabela de verificação
    // e integraria com um provedor de SMS como:
    // - Twilio
    // - AWS SNS
    // - WhatsApp Business API
    // - Zenvia
    // - Total Voice

    return new Response(
      JSON.stringify({
        success: true,
        message: "Código de verificação enviado via SMS! Verifique suas mensagens.",
        verificationCode, // Em produção, não retorne o código
        expiresAt: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao enviar SMS de recuperação:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);