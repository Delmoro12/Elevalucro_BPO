import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🆕 FRESH API: Getting records for company ${params.id}...`)
    
    // Criar cliente Supabase completamente fresco
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Timestamp': Date.now().toString()
        }
      }
    })

    // Buscar da view com timestamp para evitar cache
    const currentTime = Date.now()
    console.log(`🕒 Query timestamp: ${currentTime}`)
    
    const { data: records, error } = await supabase
      .from('financial_transactions_view')
      .select('*')
      .eq('company_id', params.id)
      .eq('created_by_side', 'client_side')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Fresh API error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar registros' },
        { status: 500 }
      )
    }

    console.log(`✅ FRESH: Found ${records?.length || 0} records`)
    if (records?.length > 0) {
      console.log('🔍 Validation status:', records.map(r => ({ 
        id: r.id.slice(-8), 
        validated: r.validated, 
        created_at: r.created_at
      })))
    }

    const response = NextResponse.json({
      success: true,
      data: records || [],
      timestamp: currentTime
    })
    
    // Headers anti-cache agressivos
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-Timestamp', currentTime.toString())
    
    return response

  } catch (error) {
    console.error('❌ Fresh API exception:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}