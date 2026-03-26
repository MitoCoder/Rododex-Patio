// api/ssw-proxy.js
// Versão com credenciais fixas - NÃO RECOMENDADO para produção, mas funciona sem configurar nada

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { conferente } = req.body;

  try {
    // Credenciais fixas (as que você tem)
    const credenciais = {
      dominio: 'ET1',
      usuario: conferente?.usuarioSSW || 'CONFLTS',
      senha: conferente?.senhaSSW || '123456',
      cpf: '11152463802'
    };

    console.log(`🔍 Buscando dados do SSW para: ${conferente?.nome}`);
    console.log(`👤 Usuário: ${credenciais.usuario}`);
    
    // TODO: Substituir pelo scraping real quando tiver a URL do SSW
    // Por enquanto, dados simulados
    const dadosProdutividade = {
      produtividade: Math.floor(Math.random() * 150) + 50,
      totalConferencias: Math.floor(Math.random() * 300) + 100,
      ultimaBipagem: new Date().toISOString(),
      status: conferente?.status === 'pausa' ? 'pausa' : 'ativo'
    };
    
    console.log(`✅ Dados obtidos:`, dadosProdutividade);
    
    return res.status(200).json(dadosProdutividade);
    
  } catch (erro) {
    console.error('❌ Erro no proxy SSW:', erro);
    return res.status(500).json({ 
      erro: 'Falha ao obter dados do SSW',
      detalhe: erro.message 
    });
  }
}