import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting clients/suppliers from database...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const isActive = searchParams.get('is_active')

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('companies_clients_suppliers')
      .select('*')
      .eq('company_id', companyId)

    // Aplicar filtros
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    } else {
      // Por padrão, mostrar apenas ativos
      query = query.eq('is_active', true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,cnpj.ilike.%${search}%,cpf.ilike.%${search}%,email_billing.ilike.%${search}%`)
    }

    // Ordenar por nome
    query = query.order('name', { ascending: true })

    const { data: clientsSuppliers, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar clientes/fornecedores' },
        { status: 500 }
      )
    }

    console.log(`✅ BPO-APP: Found ${clientsSuppliers?.length || 0} clients/suppliers`)

    return NextResponse.json({
      success: true,
      data: clientsSuppliers || [],
      total: clientsSuppliers?.length || 0
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar cliente/fornecedor
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Creating client/supplier...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { company_id, ...formData } = body

    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id is required' },
        { status: 400 }
      )
    }

    if (!formData.name || !formData.type) {
      return NextResponse.json(
        { success: false, error: 'name and type are required' },
        { status: 400 }
      )
    }

    const { data: result, error } = await supabase
      .from('companies_clients_suppliers')
      .insert({
        company_id,
        name: formData.name,
        type: formData.type,
        cnpj: formData.cnpj || null,
        cpf: formData.cpf || null,
        email_billing: formData.email_billing || null,
        whatsapp: formData.whatsapp || null,
        phone: formData.phone || null,
        pix: formData.pix || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        observations: formData.observations || null,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating client/supplier:', error)
      return NextResponse.json(
        { success: false, error: `Failed to create: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ BPO-APP: Client/supplier created:', result.id)

    return NextResponse.json({
      success: true,
      data: result,
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}