const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    ['/position', '/candidates', '/upload'],
    createProxyMiddleware({
      target: 'http://localhost:3010',
      changeOrigin: true,
    })
  );
};
