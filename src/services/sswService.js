/**
 * Serviço para integração com o sistema SSW
 * Utiliza função serverless na Vercel como proxy
 */

// URL da função serverless na Vercel
const PROXY_URL = '/api/ssw-proxy';

/**
 * Obtém os dados de produtividade do conferente a partir do sistema SSW
 * @param {Object} conferente - Dados do conferente
 * @returns {Promise<Object>} Dados de produtividade
 */
export async function obterProdutividadeSSW(conferente) {
  try {
    console.log(`📡 Consultando SSW para: ${conferente.nome}`);
    console.log(`🔑 Usuário: ${conferente.usuarioSSW || conferente.usuário_ssw}`);
    
    const resposta = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credenciais: {
          dominio: 'ET1',
          usuario: conferente.usuarioSSW || conferente.usuário_ssw,
          senha: conferente.senhaSSW || conferente.senha_ssw,
          cpf: conferente.cpf || '11152463802'
        },
        conferente: {
          id: conferente.id,
          nome: conferente.nome,
          codigo: conferente.codigo
        }
      })
    });
    
    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.erro || `HTTP ${resposta.status}`);
    }
    
    const dados = await resposta.json();
    console.log(`✅ Dados obtidos do SSW para ${conferente.nome}:`, dados);
    
    return dados;
    
  } catch (erro) {
    console.error(`❌ Erro ao consultar SSW para ${conferente.nome}:`, erro);
    throw new Error(`Falha ao obter dados do SSW: ${erro.message}`);
  }
}

/**
 * Versão para teste com dados simulados (caso a função serverless não esteja pronta)
 */
export async function obterProdutividadeSSWSimulado(conferente) {
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simula dados de produtividade variáveis baseados no ID
  const produtividadeBase = (conferente.id * 37) % 150 + 50;
  const conferenciasBase = (conferente.id * 43) % 200 + 100;
  
  return {
    produtividade: produtividadeBase,
    totalConferencias: conferenciasBase,
    ultimaBipagem: new Date().toISOString(),
    status: conferente.status === 'pausa' ? 'pausa' : 'ativo'
  };
}