// api/ssw-proxy.js
// Scraping REAL do sistema SSW

import * as cheerio from 'cheerio';

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
    console.log(`🔍 Iniciando scraping do SSW para: ${conferente.nome}`);
    
    const BASE_URL = 'https://sistema.ssw.inf.br';
    const LOGIN_URL = `${BASE_URL}/bin/sswbar/login`;
    
    // Credenciais individuais do conferente
    const credenciais = {
      dominio: 'ET1',
      cpf: '11152463802',
      usuario: conferente.usuarioSSW,
      senha: conferente.senhaSSW
    };
    
    console.log(`👤 Logando com usuário: ${credenciais.usuario}`);
    
    // Criar uma sessão com cookies
    let cookies = [];
    
    // 1. Fazer login no sistema
    const loginResponse = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      redirect: 'manual',
      body: new URLSearchParams({
        'dominio': credenciais.dominio,
        'cpf': credenciais.cpf,
        'usuario': credenciais.usuario,
        'senha': credenciais.senha,
        'act': ''
      })
    });
    
    // Extrair cookies da resposta
    const setCookie = loginResponse.headers.get('set-cookie');
    if (setCookie) {
      cookies = [setCookie];
    }
    
    if (loginResponse.status !== 302 && !loginResponse.ok) {
      throw new Error(`Falha no login: ${loginResponse.status}`);
    }
    
    console.log('✅ Login realizado com sucesso');
    
    // 2. Acessar o menu principal
    const menuResponse = await fetch(`${BASE_URL}/bin/sswbar/menu`, {
      headers: {
        'Cookie': cookies.join('; '),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    const menuHtml = await menuResponse.text();
    const $ = cheerio.load(menuHtml);
    
    // 3. Extrair os contadores de produtividade
    const manifestosAbertos = $('#btn_carga_manifesto_aberto').text().trim() || '0';
    const romaneiosAbertos = $('#btn_carga_romaneio_aberto').text().trim() || '0';
    
    // Extrair informações do usuário
    const userInfo = $('#dropdownMenuButton').parent().find('.dropdown-item-text').text();
    const filialMatch = userInfo.match(/Filial:\s*<b>([^<]+)<\/b>/);
    const filial = filialMatch ? filialMatch[1] : 'LTS';
    
    console.log(`📊 Manifestos abertos: ${manifestosAbertos}`);
    console.log(`📊 Romaneios abertos: ${romaneiosAbertos}`);
    
    // Calcular produtividade estimada
    const manifestos = parseInt(manifestosAbertos) || 0;
    const romaneios = parseInt(romaneiosAbertos) || 0;
    const produtividade = (manifestos * 25) + (romaneios * 20);
    const totalConferencias = produtividade;
    
    // Determinar status
    let status = 'ativo';
    if (manifestos === 0 && romaneios === 0) {
      status = 'pausa';
    }
    
    const dadosProdutividade = {
      produtividade: produtividade,
      totalConferencias: totalConferencias,
      ultimaBipagem: new Date().toISOString(),
      status: status,
      detalhes: {
        manifestosAbertos: manifestosAbertos,
        romaneiosAbertos: romaneiosAbertos,
        filial: filial,
        usuarioLogado: credenciais.usuario
      }
    };
    
    console.log(`✅ Dados extraídos para ${conferente.nome}:`, dadosProdutividade);
    
    return res.status(200).json(dadosProdutividade);
    
  } catch (erro) {
    console.error('❌ Erro no scraping do SSW:', erro);
    return res.status(500).json({ 
      erro: 'Falha ao obter dados do SSW',
      detalhe: erro.message,
      conferente: conferente?.nome
    });
  }
}