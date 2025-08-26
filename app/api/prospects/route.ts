import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../src/lib/supabase';

// Validação dos dados de entrada
interface ProspectRequestBody {
  // Dados pessoais do contato
  nome_contato: string;
  cpf_contato: string;
  email_contato: string;
  telefone_contato?: string;
  cargo_contato?: string;
  
  // Dados da empresa
  nome_empresa: string;
  cnpj: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  
  // Dados técnicos/operacionais
  segmento?: string;
  areas?: string[];
  bancos?: string[];
  ferramentas?: string[];
  fornecedores?: string[];
  organizacao?: string[];
  relatorios?: string[];
  
  // Expectativas e objetivos
  expectativas_sucesso?: string;
  
  // Plano selecionado
  plano: 'controle' | 'gerencial' | 'avancado';
  valor_mensal: number;
  
  // Metadados
  origem?: string;
  observacoes?: string;
}

// Função de validação básica
function validateProspectData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.nome_contato || typeof data.nome_contato !== 'string' || data.nome_contato.trim().length === 0) {
    errors.push('Nome do contato é obrigatório');
  }
  
  if (!data.cpf_contato || typeof data.cpf_contato !== 'string' || data.cpf_contato.trim().length === 0) {
    errors.push('CPF do contato é obrigatório');
  }
  
  if (!data.email_contato || typeof data.email_contato !== 'string' || !data.email_contato.includes('@')) {
    errors.push('Email do contato é obrigatório e deve ser válido');
  }
  
  if (!data.nome_empresa || typeof data.nome_empresa !== 'string' || data.nome_empresa.trim().length === 0) {
    errors.push('Nome da empresa é obrigatório');
  }
  
  if (!data.cnpj || typeof data.cnpj !== 'string' || data.cnpj.trim().length === 0) {
    errors.push('CNPJ é obrigatório');
  }
  
  if (!data.plano || !['controle', 'gerencial', 'avancado'].includes(data.plano)) {
    errors.push('Plano deve ser: controle, gerencial ou avancado');
  }
  
  if (!data.valor_mensal || typeof data.valor_mensal !== 'number' || data.valor_mensal <= 0) {
    errors.push('Valor mensal deve ser um número positivo');
  }

  return { isValid: errors.length === 0, errors };
}

// POST - Criar novo prospect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProspectRequestBody;
    
    // Validar dados
    const validation = validateProspectData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          details: validation.errors 
        }, 
        { status: 400 }
      );
    }

    // Preparar dados para inserção (limpar campos vazios)
    const prospectData = {
      nome_contato: body.nome_contato.trim(),
      cpf_contato: body.cpf_contato.trim(),
      email_contato: body.email_contato.toLowerCase().trim(),
      telefone_contato: body.telefone_contato?.trim() || null,
      cargo_contato: body.cargo_contato?.trim() || null,
      
      nome_empresa: body.nome_empresa.trim(),
      cnpj: body.cnpj.trim(),
      endereco: body.endereco?.trim() || null,
      numero: body.numero?.trim() || null,
      bairro: body.bairro?.trim() || null,
      cep: body.cep?.trim() || null,
      cidade: body.cidade?.trim() || null,
      estado: body.estado?.trim() || null,
      
      segmento: body.segmento?.trim() || null,
      areas: body.areas && body.areas.length > 0 ? body.areas : null,
      bancos: body.bancos && body.bancos.length > 0 ? body.bancos : null,
      ferramentas: body.ferramentas && body.ferramentas.length > 0 ? body.ferramentas : null,
      fornecedores: body.fornecedores && body.fornecedores.length > 0 ? body.fornecedores : null,
      organizacao: body.organizacao && body.organizacao.length > 0 ? body.organizacao : null,
      relatorios: body.relatorios && body.relatorios.length > 0 ? body.relatorios : null,
      
      expectativas_sucesso: body.expectativas_sucesso?.trim() || null,
      
      plano: body.plano,
      valor_mensal: body.valor_mensal,
      
      origem: body.origem || 'site',
      observacoes: body.observacoes?.trim() || null,
      
      status: 'pending' // Status padrão para novos prospects
    };

    // Inserir no Supabase usando service role (mais seguro)
    const { data, error } = await supabaseAdmin
      .from('prospects')
      .insert([prospectData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir prospect no Supabase:', error);
      
      // Tratar erros específicos do PostgreSQL
      if (error.code === '23505') { // Duplicate key error
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email já cadastrado. Entre em contato conosco se já enviou um formulário.' 
          }, 
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro interno do servidor. Tente novamente.' 
        }, 
        { status: 500 }
      );
    }

    // Sucesso - retornar dados sem informações sensíveis
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        nome_contato: data.nome_contato,
        nome_empresa: data.nome_empresa,
        plano: data.plano,
        valor_mensal: data.valor_mensal,
        status: data.status,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('Erro na API de prospects:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor. Tente novamente.' 
      }, 
      { status: 500 }
    );
  }
}

// GET - Buscar prospects (para admin/dashboard futuro)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const plano = searchParams.get('plano');
    const origem = searchParams.get('origem');
    const segmento = searchParams.get('segmento');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('prospects')
      .select('*', { count: 'exact' });

    // Filtros opcionais
    if (status) {
      query = query.eq('status', status);
    }
    
    if (plano) {
      query = query.eq('plano', plano);
    }

    if (origem) {
      query = query.eq('origem', origem);
    }

    if (segmento) {
      query = query.eq('segmento', segmento);
    }

    // Busca por texto (nome, empresa, email)
    if (search) {
      query = query.or(`nome_contato.ilike.%${search}%,nome_empresa.ilike.%${search}%,email_contato.ilike.%${search}%`);
    }

    // Paginação e ordenação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar prospects:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar prospects' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
      pagination: {
        offset,
        limit,
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Erro na API GET prospects:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}