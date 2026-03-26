/**
 * Serviço para integração com o sistema SSW
 * Utiliza função serverless na Vercel como proxy
 */

const PROXY_URL = '/api/ssw-proxy';

export async function obterProdutividadeSSW(conferente) {
  try {
    console.log(`📡 Consultando SSW para: ${conferente.nome}`);
    console.log(`🔑 Usuário: ${conferente.usuarioSSW}`);
    
    const resposta = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        conferente: {
          id: conferente.id,
          nome: conferente.nome,
          codigo: conferente.codigo,
          usuarioSSW: conferente.usuarioSSW,
          senhaSSW: conferente.senhaSSW
        }
      })
    });
    
    if (!resposta.ok) {
      const texto = await resposta.text();
      throw new Error(`HTTP ${resposta.status}: ${texto.substring(0, 100)}`);
    }
    
    const dados = await resposta.json();
    console.log(`✅ Dados do SSW para ${conferente.nome}:`, dados);
    
    return dados;
    
  } catch (erro) {
    console.error(`❌ Erro ao consultar SSW:`, erro);
    return {
      produtividade: 0,
      totalConferencias: 0,
      ultimaBipagem: new Date().toISOString(),
      status: 'offline',
      erro: erro.message
    };
  }
}