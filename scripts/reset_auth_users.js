// Script para deletar todos os usuários da auth
const { createClient } = require('@supabase/supabase-js');

async function resetAuthUsers() {
  // Configurar cliente admin
  const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
    console.log('💡 Execute: export SUPABASE_SERVICE_ROLE_KEY="sua_chave_aqui"');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔍 Buscando todos os usuários...');

  try {
    // Buscar todos os usuários
    const { data: users, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (listError) {
      console.error('❌ Erro ao buscar usuários:', listError);
      return;
    }

    console.log(`📊 Encontrados ${users.users.length} usuários para deletar`);

    // Deletar cada usuário
    let deleted = 0;
    for (const user of users.users) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`❌ Erro ao deletar usuário ${user.email}:`, deleteError);
        } else {
          deleted++;
          console.log(`✅ Usuário deletado: ${user.email}`);
        }
      } catch (err) {
        console.error(`❌ Erro ao deletar usuário ${user.email}:`, err.message);
      }
    }

    console.log(`🎉 Reset completo! ${deleted} usuários deletados`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

resetAuthUsers();