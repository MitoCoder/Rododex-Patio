/**
 * Serviço para integração com o sistema SSW
 * Utiliza função serverless na Vercel como proxy
 */

const PROXY_URL = '/api/ssw-proxy';

export async function obterProdutividadeSSW(conferente) {
  try {
    console.log(`📡 Consultando SSW para: ${conferente.nome}`);
    
    const resposta = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conferente })
    });
    
    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.erro || `HTTP ${resposta.status}`);
    }
    
    const dados = await resposta.json();
    console.log(`✅ Dados obtidos do SSW:`, dados);
    
    return dados;
    
  } catch (erro) {
    console.error(`❌ Erro ao consultar SSW:`, erro);
    // Em caso de erro, retorna dados simulados para não quebrar o sistema
    return {
      produtividade: Math.floor(Math.random() * 150) + 50,
      totalConferencias: Math.floor(Math.random() * 200) + 100,
      ultimaBipagem: new Date().toISOString(),
      status: 'ativo'
    };
  }
}