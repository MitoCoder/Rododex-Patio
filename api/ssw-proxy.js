// api/ssw-proxy.js
// Função serverless que faz scraping REAL do sistema SSW

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

  if (!conferente || !conferente.usuarioSSW) {
    return res.status(200).json({
      produtividade: 0,
      totalConferencias: 0,
      ultimaBipagem: new Date().toISOString(),
      status: 'offline',
      detalhes: { erro: 'Credenciais não informadas' }
    });
  }

  try {
    console.log(`🔍 Iniciando scraping do SSW para: ${conferente.nome}`);
    console.log(`👤 Usuário: ${conferente.usuarioSSW}`);
    
    const BASE_URL = 'https://sistema.ssw.inf.br';
    const LOGIN_URL = `${BASE_URL}/bin/sswbar/login`;
    
    // 1. Fazer login no sistema com as credenciais do conferente
    const loginResponse = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual',
      body: new URLSearchParams({
        'dominio': 'ET1',
        'cpf': '11152463802',
        'usuario': conferente.usuarioSSW,
        'senha': conferente.senhaSSW,
        'act': ''
      })
    });
    
    const setCookie = loginResponse.headers.get('set-cookie');
    const cookies = setCookie ? [setCookie] : [];
    
    if (loginResponse.status !== 302 && !loginResponse.ok) {
      console.log(`❌ Login falhou para ${conferente.usuarioSSW}: ${loginResponse.status}`);
      return res.status(200).json({
        produtividade: 0,
        totalConferencias: 0,
        ultimaBipagem: new Date().toISOString(),
        status: 'offline',
        detalhes: { erro: `Login falhou: ${loginResponse.status}` }
      });
    }
    
    console.log('✅ Login realizado com sucesso');
    
    // 2. Acessar a tela de CARGA DE ROMANEIO
    const romaneioResponse = await fetch(`${BASE_URL}/bin/sswbar`, {
      method: 'POST',
      headers: {
        'Cookie': cookies.join('; '),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: new URLSearchParams({
        'act': 'carga_romaneio',
        'dummy': Date.now().toString()
      })
    });
    
    const romaneioHtml = await romaneioResponse.text();
    
    // 3. Extrair os dados usando regex (mais simples que cheerio)
    const extractNumber = (html, id) => {
      const regex = new RegExp(`<td id="${id}"[^>]*>([^<]+)</td>`);
      const match = html.match(regex);
      return match ? parseInt(match[1].trim()) || 0 : 0;
    };
    
    const extractFloat = (html, id) => {
      const regex = new RegExp(`<td id="${id}"[^>]*>([^<]+)</td>`);
      const match = html.match(regex);
      if (match) {
        const value = match[1].trim().replace(',', '.');
        return parseFloat(value) || 0;
      }
      return 0;
    };
    
    const extractHidden = (html, id) => {
      const regex = new RegExp(`<input type="hidden" name="${id}" id="${id}" value="([^"]+)"`);
      const match = html.match(regex);
      return match ? match[1] : '';
    };
    
    const totalQtde = extractNumber(romaneioHtml, 'total_qtde');
    const capQtde = extractNumber(romaneioHtml, 'cap_qtde');
    const falQtde = extractNumber(romaneioHtml, 'fal_qtde');
    
    const totalPeso = extractFloat(romaneioHtml, 'total_peso');
    const capPeso = extractFloat(romaneioHtml, 'cap_peso');
    
    const totalVlr = extractFloat(romaneioHtml, 'total_vlr');
    const capVlr = extractFloat(romaneioHtml, 'cap_vlr');
    
    const placa = extractHidden(romaneioHtml, 'placa') || 'N/A';
    const filial = extractHidden(romaneioHtml, 'filial') || 'LTS';
    const usuario = extractHidden(romaneioHtml, 'usuario') || conferente.usuarioSSW;
    
    console.log(`📊 Dados extraídos da tela de CARGA DE ROMANEIO:`);
    console.log(`   Placa: ${placa}`);
    console.log(`   Total volumes: ${totalQtde}`);
    console.log(`   Volumes lidos: ${capQtde}`);
    console.log(`   Volumes faltam: ${falQtde}`);
    console.log(`   Peso lido: ${capPeso} kg`);
    console.log(`   Valor lido: R$ ${capVlr}`);
    
    // Calcular produtividade
    const produtividade = capQtde;
    const totalConferencias = capQtde;
    
    let status = 'pausa';
    if (totalQtde > 0 && capQtde < totalQtde) {
      status = 'ativo';
    } else if (capQtde === 0 && totalQtde === 0) {
      status = 'pausa';
    } else if (capQtde === totalQtde && totalQtde > 0) {
      status = 'pausa';
    }
    
    const dadosProdutividade = {
      produtividade: produtividade,
      totalConferencias: totalConferencias,
      ultimaBipagem: new Date().toISOString(),
      status: status,
      detalhes: {
        placa: placa,
        totalVolumes: totalQtde,
        volumesLidos: capQtde,
        volumesFaltam: falQtde,
        pesoLido: capPeso,
        pesoTotal: totalPeso,
        valorLido: capVlr,
        valorTotal: totalVlr,
        filial: filial,
        usuarioLogado: usuario,
        percentualConcluido: totalQtde > 0 ? ((capQtde / totalQtde) * 100).toFixed(1) : 0
      }
    };
    
    console.log(`✅ Produtividade para ${conferente.nome}: ${capQtde}/${totalQtde} volumes (${dadosProdutividade.detalhes.percentualConcluido}%)`);
    
    return res.status(200).json(dadosProdutividade);
    
  } catch (erro) {
    console.error('❌ Erro no scraping do SSW:', erro);
    return res.status(200).json({
      produtividade: 0,
      totalConferencias: 0,
      ultimaBipagem: new Date().toISOString(),
      status: 'offline',
      detalhes: { erro: erro.message }
    });
  }
}