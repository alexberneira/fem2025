const { getDefaultConfig } = require('@react-native/metro-config');
const fs = require('fs');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Adicionar suporte para React Native Web
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');
config.resolver.platforms.push('web');

// Configurar middleware para servir HTML na raiz
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Servir o arquivo HTML na raiz
      if (req.url === '/' || req.url === '/index.html') {
        const htmlPath = path.join(__dirname, 'public', 'index.html');
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, 'utf8');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
          return;
        }
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
