// Servidor HTTP simple para Mi Pececito
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;

// Tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  
  // Si es la raíz, servir index.html
  if (filePath === './') {
    filePath = './index.html';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Archivo no encontrado
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>404 - Archivo no encontrado</h1>
          <p>No se pudo encontrar: ${filePath}</p>
          <p><a href="/huevo-con-imagenes.html">🥚 Ir al huevo</a></p>
          <p><a href="/juego-completo-sin-modulos.html">🎮 Ir al juego</a></p>
        `);
      } else {
        // Error del servidor
        res.writeHead(500);
        res.end('Error del servidor: ' + error.code);
      }
    } else {
      // Servir archivo
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
  console.log(`🥚 Huevo: http://localhost:${port}/huevo-con-imagenes.html`);
  console.log(`🎮 Juego: http://localhost:${port}/juego-completo-sin-modulos.html`);
  console.log('');
  console.log('Presiona Ctrl+C para detener el servidor');
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
});
