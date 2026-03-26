// api/ssw-proxy.js
export default async function handler(req, res) {
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
    console.log(`🔍 Iniciando scraping para: ${conferente.nome}`);
    console.log(`👤 Usuário: ${conferente.usuarioSSW}`);
    
    const BASE_URL = 'https://sistema.ssw.inf.br';
    const LOGIN_URL = `${BASE_URL}/bin/sswbar/login`;
    
    // Headers completos - simulando um navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': BASE_URL,
      'Referer': LOGIN_URL,
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive'
    };
    
    // Fazer a requisição de login
    const loginResponse = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: headers,
      redirect: 'manual',
      body: new URLSearchParams({
        'dominio': 'ET1',
        'cpf': '11152463802',
        'usuario': conferente.usuarioSSW,
        'senha': conferente.senhaSSW,
        'act': ''
      })
    });
    
    console.log('📡 Status do login:', loginResponse.status);
    
    // Se deu 403, pode ser que precise de cookies da página de login primeiro
    if (loginResponse.status === 403) {
      console.log('⚠️ 403 Forbidden - Tentando pegar cookies primeiro...');
      
      // Primeiro, acessar a página de login para pegar cookies
      const getLoginPage = await fetch(LOGIN_URL, {
        method: 'GET',
        headers: {
          'User-Agent': headers['User-Agent'],
          'Accept': headers['Accept'],
          'Accept-Language': headers['Accept-Language']
        }
      });
      
      const cookies = getLoginPage.headers.get('set-cookie');
      const cookieHeader = cookies ? cookies : '';
      
      console.log('🍪 Cookies obtidos da página de login');
      
      // Tentar login novamente com os cookies
      const loginAttempt = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          ...headers,
          'Cookie': cookieHeader
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
      
      console.log('📡 Segunda tentativa - Status:', loginAttempt.status);
      
      if (loginAttempt.status === 302) {
        const setCookies = loginAttempt.headers.get('set-cookie');
        const finalCookies = setCookies ? [setCookies] : [];
        
        // Acessar o menu
        const menuResponse = await fetch(`${BASE_URL}/bin/sswbar/menu`, {
          headers: {
            'Cookie': finalCookies.join('; '),
            'User-Agent': headers['User-Agent']
          }
        });
        
        const menuHtml = await menuResponse.text();
        
        // Extrair dados do menu
        const totalManifestos = menuHtml.match(/btn_carga_manifesto_aberto[^>]*>(\d+)</)?.[1] || '0';
        const totalRomaneios = menuHtml.match(/btn_carga_romaneio_aberto[^>]*>(\d+)</)?.[1] || '0';
        
        return res.status(200).json({
          produtividade: (parseInt(totalManifestos) * 25) + (parseInt(totalRomaneios) * 20),
          totalConferencias: (parseInt(totalManifestos) * 25) + (parseInt(totalRomaneios) * 20),
          ultimaBipagem: new Date().toISOString(),
          status: (parseInt(totalManifestos) > 0 || parseInt(totalRomaneios) > 0) ? 'ativo' : 'pausa',
          detalhes: {
            manifestosAbertos: totalManifestos,
            romaneiosAbertos: totalRomaneios,
            usuarioLogado: conferente.usuarioSSW
          }
        });
      }
      
      return res.status(200).json({
        produtividade: 0,
        totalConferencias: 0,
        ultimaBipagem: new Date().toISOString(),
        status: 'offline',
        detalhes: { erro: `Login falhou: ${loginAttempt.status}` }
      });
    }
    
    if (loginResponse.status === 302) {
      const setCookie = loginResponse.headers.get('set-cookie');
      const cookies = setCookie ? [setCookie] : [];
      
      // Acessar o menu
      const menuResponse = await fetch(`${BASE_URL}/bin/sswbar/menu`, {
        headers: {
          'Cookie': cookies.join('; '),
          'User-Agent': headers['User-Agent']
        }
      });
      
      const menuHtml = await menuResponse.text();
      
      const totalManifestos = menuHtml.match(/btn_carga_manifesto_aberto[^>]*>(\d+)</)?.[1] || '0';
      const totalRomaneios = menuHtml.match(/btn_carga_romaneio_aberto[^>]*>(\d+)</)?.[1] || '0';
      
      return res.status(200).json({
        produtividade: (parseInt(totalManifestos) * 25) + (parseInt(totalRomaneios) * 20),
        totalConferencias: (parseInt(totalManifestos) * 25) + (parseInt(totalRomaneios) * 20),
        ultimaBipagem: new Date().toISOString(),
        status: (parseInt(totalManifestos) > 0 || parseInt(totalRomaneios) > 0) ? 'ativo' : 'pausa',
        detalhes: {
          manifestosAbertos: totalManifestos,
          romaneiosAbertos: totalRomaneios,
          usuarioLogado: conferente.usuarioSSW
        }
      });
    }
    
    // Se chegou aqui, tentar verificar se o login falhou por credenciais
    const texto = await loginResponse.text();
    if (texto.includes('Usuário') && texto.includes('inválido')) {
      return res.status(200).json({
        produtividade: 0,
        totalConferencias: 0,
        ultimaBipagem: new Date().toISOString(),
        status: 'offline',
        detalhes: { erro: 'Usuário ou senha inválidos' }
      });
    }
    
    return res.status(200).json({
      produtividade: 0,
      totalConferencias: 0,
      ultimaBipagem: new Date().toISOString(),
      status: 'offline',
      detalhes: { erro: `Login falhou: ${loginResponse.status}` }
    });
    
  } catch (erro) {
    console.error('❌ Erro:', erro);
    return res.status(200).json({
      produtividade: 0,
      totalConferencias: 0,
      ultimaBipagem: new Date().toISOString(),
      status: 'offline',
      detalhes: { erro: erro.message }
    });
  }
}