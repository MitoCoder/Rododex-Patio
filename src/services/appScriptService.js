// Serviço para integração com Google AppScript
// Usando proxy para evitar CORS
const URL_APPSCRIPT = '/api/appscript-proxy';

/**
 * Busca todos os conferentes cadastrados na planilha
 */
export async function buscarConferentes() {
  try {
    console.log('🔍 Buscando conferentes via proxy...');
    const resposta = await fetch(`${URL_APPSCRIPT}?acao=listar`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const dados = await resposta.json();
    console.log('✅ Conferentes carregados:', dados);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    console.error('❌ Erro ao buscar conferentes:', erro);
    return [];
  }
}

/**
 * Salva os dados de produtividade de um conferente
 */
export async function salvarProdutividade(dadosProdutividade) {
  try {
    console.log('💾 Salvando produtividade:', dadosProdutividade);
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acao: 'salvar',
        ...dadosProdutividade
      })
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const resultado = await resposta.json();
    console.log('✅ Produtividade salva:', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Erro ao salvar produtividade:', erro);
    throw new Error('Falha ao salvar dados de produtividade');
  }
}

/**
 * Salva um novo conferente ou atualiza existente
 */
export async function salvarConferente(conferente) {
  try {
    console.log('💾 Salvando conferente:', conferente);
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acao: 'salvar_conferente',
        conferente
      })
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const resultado = await resposta.json();
    console.log('✅ Conferente salvo:', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Erro ao salvar conferente:', erro);
    throw new Error('Falha ao salvar conferente');
  }
}

/**
 * Deleta um conferente
 */
export async function deletarConferente(id) {
  try {
    console.log('🗑️ Deletando conferente ID:', id);
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acao: 'deletar_conferente',
        id
      })
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const resultado = await resposta.json();
    console.log('✅ Conferente deletado:', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Erro ao deletar conferente:', erro);
    throw new Error('Falha ao deletar conferente');
  }
}

/**
 * Atualiza o status do conferente
 */
export async function atualizarStatus(conferenteId, status) {
  try {
    console.log('🔄 Atualizando status:', conferenteId, '->', status);
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acao: 'atualizar_status',
        conferenteId,
        status
      })
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const resultado = await resposta.json();
    return resultado;
  } catch (erro) {
    console.error('❌ Erro ao atualizar status:', erro);
    throw new Error('Falha ao atualizar status do conferente');
  }
}

/**
 * Registra uma nova conferência realizada
 */
export async function registrarConferencia(conferencia) {
  try {
    console.log('📝 Registrando conferência:', conferencia);
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acao: 'registrar_conferencia',
        ...conferencia
      })
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const resultado = await resposta.json();
    console.log('✅ Conferência registrada:', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Erro ao registrar conferência:', erro);
    throw new Error('Falha ao registrar conferência');
  }
}

/**
 * Função auxiliar para testar conexão
 */
export async function testarConexao() {
  try {
    console.log('🔌 Testando conexão via proxy...');
    const resposta = await fetch(`${URL_APPSCRIPT}?acao=listar`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!resposta.ok) {
      console.error('❌ Falha na conexão:', resposta.status);
      return { sucesso: false, status: resposta.status };
    }
    
    const dados = await resposta.json();
    console.log('✅ Conexão OK! Dados recebidos:', dados);
    return { sucesso: true, dados };
  } catch (erro) {
    console.error('❌ Erro de conexão:', erro);
    return { sucesso: false, erro: erro.message };
  }
}