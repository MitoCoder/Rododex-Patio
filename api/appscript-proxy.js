// api/appscript-proxy.js
// Proxy para o Google AppScript - resolve CORS

const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlH2R7v73XXpJc0En27QC8arYpRrRHLNxIlgP8hCf5k4PJgK6qLFOGtieAz07HlxFljg/exec';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Para GET, passar os parâmetros
      const params = new URLSearchParams(req.query);
      const url = `${APPSCRIPT_URL}?${params.toString()}`;
      
      console.log('🔀 Proxy GET:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const data = await response.json();
      return res.status(200).json(data);
      
    } else if (req.method === 'POST') {
      // Para POST, passar o body
      console.log('🔀 Proxy POST:', APPSCRIPT_URL);
      console.log('📦 Body:', req.body);
      
      const response = await fetch(APPSCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      return res.status(200).json(data);
    }
    
    return res.status(405).json({ erro: 'Método não permitido' });
    
  } catch (erro) {
    console.error('❌ Erro no proxy:', erro);
    return res.status(500).json({ erro: erro.message });
  }
}