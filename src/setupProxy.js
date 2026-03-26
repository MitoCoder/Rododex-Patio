const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/appscript',
    createProxyMiddleware({
      target: 'https://script.google.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/appscript': '/macros/s/AKfycbwlH2R7v73XXpJc0En27QC8arYpRrRHLNxIlgP8hCf5k4PJgK6qLFOGtieAz07HlxFljg/exec',
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔀 Proxy:', req.method, req.url);
      },
      onError: (err, req, res) => {
        console.error('❌ Erro no proxy:', err);
      }
    })
  );
};