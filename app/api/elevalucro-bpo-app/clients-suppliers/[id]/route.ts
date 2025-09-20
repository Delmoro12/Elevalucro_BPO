import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

// GET - Buscar cliente/fornecedor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API BPO-APP: Getting client/supplier by ID:', params.id)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { data: clientSupplier, error } = await supabase
      .from('companies_clients_suppliers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Cliente/fornecedor não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ BPO-APP: Client/supplier found:', params.id)

    return NextResponse.json({
      success: true,
      data: clientSupplier,
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente/fornecedor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API BPO-APP: Updating client/supplier:', params.id)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()

    const { data: result, error } = await supabase
      .from('companies_clients_suppliers')
      .update({
        name: body.name,
        type: body.type,
        cnpj: body.cnpj || null,
        cpf: body.cpf || null,
        email_billing: body.email_billing || null,
        whatsapp: body.whatsapp || null,
        phone: body.phone || null,
        pix: body.pix || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zip_code: body.zip_code || null,
        observations: body.observations || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating client/supplier:', error)
      return NextResponse.json(
        { success: false, error: `Failed to update: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ BPO-APP: Client/supplier updated:', params.id)

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

// DELETE - Excluir cliente/fornecedor (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API BPO-APP: Deleting client/supplier:', params.id)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Soft delete - marcar como inativo
    const { error } = await supabase
      .from('companies_clients_suppliers')
      .update({ is_active: false })
      .eq('id', params.id)

    if (error) {
      console.error('❌ Error deleting client/supplier:', error)
      return NextResponse.json(
        { success: false, error: `Failed to delete: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ BPO-APP: Client/supplier deleted (soft):', params.id)

    return NextResponse.json({
      success: true,
      message: 'Cliente/fornecedor excluído com sucesso',
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}