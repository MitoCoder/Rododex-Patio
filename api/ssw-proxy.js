// api/ssw-proxy.js - Versão REAL com scraping
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { credenciais, conferente } = req.body;
  let browser = null;

  try {
    // Iniciar navegador na Vercel
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // 1. Fazer login no SSW
    await page.goto(process.env.SSW_LOGIN_URL, { waitUntil: 'networkidle0' });
    
    await page.type('#dominio', credenciais.dominio);
    await page.type('#usuario', credenciais.usuario);
    await page.type('#senha', credenciais.senha);
    await page.click('#btn-login');
    
    await page.waitForNavigation();
    
    // 2. Navegar para página do conferente
    await page.goto(`${process.env.SSW_BASE_URL}/conferente/${conferente.codigo}`);
    
    // 3. Extrair dados
    const dados = await page.evaluate(() => {
      // Seletores reais do sistema SSW
      const produtividade = document.querySelector('#produtividade')?.innerText || '0';
      const total = document.querySelector('#total-conferencias')?.innerText || '0';
      const status = document.querySelector('#status')?.innerText || 'ativo';
      
      return {
        produtividade: parseInt(produtividade),
        totalConferencias: parseInt(total),
        status: status.toLowerCase(),
        ultimaBipagem: new Date().toISOString()
      };
    });
    
    await browser.close();
    
    return res.status(200).json(dados);
    
  } catch (erro) {
    console.error('Erro no scraping:', erro);
    if (browser) await browser.close();
    return res.status(500).json({ erro: erro.message });
  }
}