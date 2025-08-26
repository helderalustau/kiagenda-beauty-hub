import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  userType: 'admin' | 'client';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userType }: PasswordResetRequest = await req.json();
    
    console.log(`🔄 Solicitação de reset de senha via email para ${userType}:`, email);

    // Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se o usuário existe na tabela correspondente
    const tableName = userType === 'admin' ? 'admin_auth' : 'client_auth';
    const { data: userData, error: searchError } = await supabase
      .from(tableName)
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (searchError || !userData) {
      console.error(`❌ ${userType} não encontrado:`, searchError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `E-mail não encontrado no sistema de ${userType === 'admin' ? 'administradores' : 'clientes'}`
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

    // Gerar token de recuperação (simples para este exemplo)
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token na tabela de tokens (você pode criar uma tabela específica)
    // Por enquanto, vamos usar o sistema de metadados ou criar uma tabela simples
    
    // Criar link de recuperação
    const resetUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/${userType}-reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "Recuperação de Senha <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperação de Senha - Sistema de Agendamentos",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Recuperação de Senha</h1>
          
          <p>Olá, ${userData.name || 'usuário'}!</p>
          
          <p>Você solicitou a recuperação da sua senha. Clique no link abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Recuperar Senha
            </a>
          </div>
          
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Este link é válido por 1 hora. Se você não solicitou esta recuperação, pode ignorar este email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Sistema de Agendamentos - Recuperação de Senha
          </p>
        </div>
      `,
    });

    console.log("✅ Email de recuperação enviado:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de recuperação enviado com sucesso! Verifique sua caixa de entrada e spam.",
        resetToken // Em produção, não retorne o token
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
    console.error("❌ Erro ao enviar email de recuperação:", error);
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