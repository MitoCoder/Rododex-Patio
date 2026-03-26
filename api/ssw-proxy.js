// api/ssw-proxy.js
// Scraping REAL do sistema SSW - Extrai dados da tela de carga de romaneio

import * as cheerio from 'cheerio';

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
    return res.status(400).json({ erro: 'Conferente sem credenciais' });
  }

  let cookies = [];

  try {
    console.log(`🔍 Iniciando scraping do SSW para: ${conferente.nome}`);
    console.log(`👤 Usuário: ${conferente.usuarioSSW}`);
    
    const BASE_URL = 'https://sistema.ssw.inf.br';
    const LOGIN_URL = `${BASE_URL}/bin/sswbar/login`;
    
    // 1. Fazer login no sistema
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
    if (setCookie) {
      cookies = [setCookie];
    }
    
    if (loginResponse.status !== 302 && !loginResponse.ok) {
      throw new Error(`Falha no login: ${loginResponse.status}`);
    }
    
    console.log('✅ Login realizado com sucesso');
    
    // 2. Acessar a tela de Carga de Romaneio
    const romaneioResponse = await fetch(`${BASE_URL}/bin/sswbar`, {
      method: 'POST',
      headers: {
        'Cookie': cookies.join('; '),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'act': 'carga_romaneio',
        'dummy': Date.now().toString()
      })
    });
    
    const romaneioHtml = await romaneioResponse.text();
    const $ = cheerio.load(romaneioHtml);
    
    // 3. Extrair os dados da tela de carga de romaneio
    const totalQtde = parseInt($('#total_qtde').text().trim()) || 0;
    const capQtde = parseInt($('#cap_qtde').text().trim()) || 0;
    const falQtde = parseInt($('#fal_qtde').text().trim()) || 0;
    
    const totalPeso = parseFloat($('#total_peso').text().trim().replace(',', '.')) || 0;
    const capPeso = parseFloat($('#cap_peso').text().trim().replace(',', '.')) || 0;
    
    const totalVlr = parseFloat($('#total_vlr').text().trim().replace(',', '.')) || 0;
    const capVlr = parseFloat($('#cap_vlr').text().trim().replace(',', '.')) || 0;
    
    // Extrair informações adicionais
    const placa = $('#placa').val() || $('#placa').text().trim() || 'N/A';
    const usuario = $('#usuario').val() || 'conflts';
    const filial = $('#filial').val() || 'LTS';
    
    console.log(`📊 Dados extraídos:`);
    console.log(`   Placa: ${placa}`);
    console.log(`   Total volumes: ${totalQtde}`);
    console.log(`   Volumes lidos: ${capQtde}`);
    console.log(`   Volumes faltam: ${falQtde}`);
    console.log(`   Peso lido: ${capPeso} kg`);
    console.log(`   Valor lido: R$ ${capVlr}`);
    
    // Calcular produtividade (volumes lidos)
    const produtividade = capQtde;
    const totalConferencias = capQtde;
    
    // Determinar status
    let status = 'ativo';
    if (totalQtde === 0) {
      status = 'pausa';
    } else if (capQtde === totalQtde && totalQtde > 0) {
      status = 'pausa'; // Concluiu o romaneio atual
    } else if (capQtde > 0) {
      status = 'ativo';
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
    return res.status(500).json({ 
      erro: 'Falha ao obter dados do SSW',
      detalhe: erro.message,
      conferente: conferente?.nome
    });
  }
}