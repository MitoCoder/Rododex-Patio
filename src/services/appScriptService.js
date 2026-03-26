// Serviço para integração com Google AppScript
// URL do seu AppScript após fazer o deploy como aplicação web
const URL_APPSCRIPT = 'https://script.google.com/macros/s/AKfycbwlH2R7v73XXpJc0En27QC8arYpRrRHLNxIlgP8hCf5k4PJgK6qLFOGtieAz07HlxFljg/exec';

/**
 * Busca todos os conferentes cadastrados na planilha
 */
export async function buscarConferentes() {
  try {
    const resposta = await fetch(`${URL_APPSCRIPT}?acao=listar`, {
      method: 'GET',
      mode: 'cors'
    });
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    
    const dados = await resposta.json();
    return dados;
  } catch (erro) {
    console.error('Erro ao buscar conferentes:', erro);
    throw new Error('Falha ao carregar lista de conferentes');
  }
}

/**
 * Salva os dados de produtividade de um conferente
 * @param {Object} dadosProdutividade - Dados do conferente e sua produtividade
 */
export async function salvarProdutividade(dadosProdutividade) {
  try {
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
    return resultado;
  } catch (erro) {
    console.error('Erro ao salvar produtividade:', erro);
    throw new Error('Falha ao salvar dados de produtividade');
  }
}

/**
 * Atualiza o status do conferente (ativo, pausa, offline)
 * @param {string} conferenteId - ID do conferente
 * @param {string} status - Novo status
 */
export async function atualizarStatus(conferenteId, status) {
  try {
    const resposta = await fetch(URL_APPSCRIPT, {
      method: 'PUT',
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
    console.error('Erro ao atualizar status:', erro);
    throw new Error('Falha ao atualizar status do conferente');
  }
}

/**
 * Registra uma nova conferência realizada
 * @param {Object} conferencia - Dados da conferência realizada
 */
export async function registrarConferencia(conferencia) {
  try {
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
    return resultado;
  } catch (erro) {
    console.error('Erro ao registrar conferência:', erro);
    throw new Error('Falha ao registrar conferência');
  }
}