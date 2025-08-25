import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AppointmentCompletionRequest {
  appointmentId: string
}

interface ServiceInfo {
  name: string
  duration: number
  price: number
  type: 'main' | 'additional'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 Process Appointment Completion - Starting...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { appointmentId }: AppointmentCompletionRequest = await req.json()
    
    if (!appointmentId) {
      console.error('❌ Appointment ID is required')
      return new Response(
        JSON.stringify({ error: 'Appointment ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('📋 Processing appointment:', appointmentId)

    // Buscar dados completos do appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        salon_id,
        status,
        appointment_date,
        appointment_time,
        notes,
        service:services(id, name, price, duration_minutes),
        client:client_auth(id, name, phone, email)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      console.error('❌ Failed to fetch appointment:', appointmentError)
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Appointment data:', {
      id: appointment.id,
      status: appointment.status,
      service: appointment.service?.name,
      servicePrice: appointment.service?.price,
      notes: appointment.notes
    })

    // Verificar se appointment está concluído
    if (appointment.status !== 'completed') {
      console.log('ℹ️ Appointment is not completed, skipping financial processing')
      return new Response(
        JSON.stringify({ message: 'Appointment is not completed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se já existe transação para este appointment
    const { data: existingTransactions } = await supabase
      .from('financial_transactions')
      .select('id, amount')
      .eq('appointment_id', appointmentId)

    if (existingTransactions && existingTransactions.length > 0) {
      console.log('ℹ️ Financial transactions already exist for this appointment:', existingTransactions.length)
      return new Response(
        JSON.stringify({ 
          message: 'Financial transactions already exist',
          existingTransactions: existingTransactions.length
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Função para parse de serviços adicionais
    const parseAdditionalServices = (notes: string): ServiceInfo[] => {
      if (!notes) return []
      
      const additionalServicesMatch = notes.match(/Serviços Adicionais:\s*(.+?)(?:\n\n|$)/s)
      if (!additionalServicesMatch) return []
      
      const servicesText = additionalServicesMatch[1]
      const serviceMatches = servicesText.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/g)
      
      if (!serviceMatches) return []
      
      return serviceMatches.map(match => {
        const parts = match.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/)
        if (!parts) return null
        
        return {
          name: parts[1].trim(),
          duration: parseInt(parts[2]),
          price: parseFloat(parts[3].replace(',', '')),
          type: 'additional' as const
        }
      }).filter(Boolean) as ServiceInfo[]
    }

    // Criar lista completa de serviços
    const services: ServiceInfo[] = []
    
    // Serviço principal
    if (appointment.service) {
      services.push({
        name: appointment.service.name,
        duration: appointment.service.duration_minutes || 0,
        price: appointment.service.price || 0,
        type: 'main'
      })
    }

    // Serviços adicionais
    const additionalServices = parseAdditionalServices(appointment.notes || '')
    services.push(...additionalServices)

    console.log('💰 Services breakdown:', services.map(s => ({
      name: s.name,
      price: s.price,
      type: s.type
    })))

    // Calcular totais
    const totalAmount = services.reduce((sum, service) => sum + service.price, 0)
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0)

    console.log('💰 Financial totals:', {
      totalAmount,
      totalDuration,
      servicesCount: services.length
    })

    // Criar UMA ÚNICA transação financeira com o valor total
    const transactionDescription = `${appointment.service?.name || 'Serviço'} - ${appointment.client?.name || 'Cliente'}`
    
    const { data: transaction, error: transactionError } = await supabase
      .from('financial_transactions')
      .insert({
        salon_id: appointment.salon_id,
        appointment_id: appointment.id,
        transaction_type: 'income',
        amount: totalAmount,
        description: transactionDescription,
        category: 'service',
        payment_method: 'cash',
        transaction_date: appointment.appointment_date,
        status: 'completed',
        metadata: {
          auto_generated: true,
          edge_function_generated: true,
          appointment_notes: appointment.notes,
          services_breakdown: services,
          total_amount: totalAmount,
          total_duration: totalDuration,
          service_count: services.length,
          main_service: appointment.service?.name,
          client_name: appointment.client?.name,
          appointment_time: appointment.appointment_time
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('❌ Failed to create financial transaction:', transactionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create financial transaction', details: transactionError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Financial transaction created successfully:', {
      transactionId: transaction.id,
      amount: transaction.amount,
      appointmentId: appointment.id
    })

    // Retornar resultado completo
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Financial transaction created successfully',
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          appointmentId: appointment.id
        },
        servicesBreakdown: services,
        totals: {
          amount: totalAmount,
          duration: totalDuration,
          servicesCount: services.length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error in process-appointment-completion:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})