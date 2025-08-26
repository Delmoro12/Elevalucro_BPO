import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../src/lib/supabase';
import { prospectService } from '../../../../src/services/prospectService';

// GET - Buscar prospect por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from('prospects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar prospect:', error);
      return NextResponse.json(
        { success: false, error: 'Prospect não encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro na API GET prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

// PATCH - Atualizar prospect por ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validar status se estiver sendo atualizado
    const validStatuses = ['pending', 'contacted', 'contract_sent', 'signed', 'rejected'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Status inválido. Use: pending, contacted, contract_sent, signed ou rejected' 
        }, 
        { status: 400 }
      );
    }

    // Atualizar o prospect
    const { data, error } = await supabaseAdmin
      .from('prospects')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar prospect:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Prospect não encontrado' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar prospect' }, 
        { status: 500 }
      );
    }

    // Se status foi alterado para 'signed', trigger automatic signup
    if (body.status === 'signed') {
      console.log('🎯 Status alterado para signed - iniciando auto signup');
      
      try {
        const signupResult = await prospectService.triggerAutoSignup(id);
        
        if (signupResult.success) {
          console.log('✅ Auto signup executado com sucesso');
          return NextResponse.json({
            success: true,
            data,
            message: 'Status atualizado e cliente criado automaticamente',
            autoSignup: signupResult
          });
        } else {
          console.error('❌ Erro no auto signup:', signupResult.error);
          return NextResponse.json({
            success: true,
            data,
            message: `Status atualizado para ${body.status}, mas houve erro no signup automático: ${signupResult.error}`,
            autoSignup: signupResult
          });
        }
      } catch (signupError) {
        console.error('❌ Erro fatal no auto signup:', signupError);
        return NextResponse.json({
          success: true,
          data,
          message: `Status atualizado para ${body.status}, mas houve erro no signup automático`,
          autoSignupError: String(signupError)
        });
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Status atualizado para ${body.status || 'atualizado'}`
    });

  } catch (error) {
    console.error('Erro na API PATCH prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

// DELETE - Deletar prospect por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar se o prospect existe
    const { data: existingProspect, error: fetchError } = await supabaseAdmin
      .from('prospects')
      .select('id, nome_contato, nome_empresa')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Prospect não encontrado' }, 
        { status: 404 }
      );
    }

    // Deletar o prospect
    const { error: deleteError } = await supabaseAdmin
      .from('prospects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao deletar prospect:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar prospect' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Prospect "${existingProspect.nome_contato}" (${existingProspect.nome_empresa}) deletado com sucesso`
    });

  } catch (error) {
    console.error('Erro na API DELETE prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}