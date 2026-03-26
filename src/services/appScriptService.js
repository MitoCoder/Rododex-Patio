// Serviço para integração com Google AppScript
const URL_APPSCRIPT = 'https://script.google.com/macros/s/AKfycbwlH2R7v73XXpJc0En27QC8arYpRrRHLNxIlgP8hCf5k4PJgK6qLFOGtieAz07HlxFljg/exec';

/**
 * Busca todos os conferentes cadastrados na planilha
 */
export async function buscarConferentes() {
  try {
    console.log('🔍 Buscando conferentes do AppScript...');
    console.log('📡 URL:', `${URL_APPSCRIPT}?acao=listar`);
    
    const resposta = await fetch(`${URL_APPSCRIPT}?acao=listar`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('📊 Status da resposta:', resposta.status);
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status} - ${resposta.statusText}`);
    }
    
    const dados = await resposta.json();
    console.log('📦 Dados brutos do AppScript:', dados);
    
    // Verificar se a resposta é um erro
    if (dados && dados.erro) {
      console.error('❌ AppScript retornou erro:', dados.erro);
      throw new Error(dados.erro);
    }
    
    // Garantir que sempre retornamos um array
    if (!dados || !Array.isArray(dados)) {
      console.warn('⚠️ AppScript não retornou um array, retornando array vazio');
      return [];
    }
    
    console.log(`✅ Conferentes carregados: ${dados.length} registros`);
    return dados;
    
  } catch (erro) {
    console.error('❌ Erro ao buscar conferentes:', erro);
    // Retorna array vazio em caso de erro para não quebrar a aplicação
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
      mode: 'cors',
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
      mode: 'cors',
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
      mode: 'cors',
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
    console.log('🔄 Atualizando status do conferente:', conferenteId, '->', status);
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'POST',
      mode: 'cors',
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
      mode: 'cors',
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
 * Função auxiliar para testar conexão com AppScript
 */
export async function testarConexao() {
  try {
    console.log('🔌 Testando conexão com AppScript...');
    const resposta = await fetch(`${URL_APPSCRIPT}?acao=listar`, {
      method: 'GET',
      mode: 'cors',
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