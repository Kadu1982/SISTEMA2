import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || '4173');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const PROXY_PREFIX = process.env.PROXY_PREFIX || '/api';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

function sendNotFound(res) {
  res.writeHead(404);
  res.end('Not Found');
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const requestUrl = decodeURIComponent(req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (requestUrl.startsWith(PROXY_PREFIX)) {
    try {
      const targetUrl = new URL(requestUrl, BACKEND_URL);
      const client = targetUrl.protocol === 'https:' ? https : http;
      const proxyReq = client.request(targetUrl, {
        method: req.method,
        headers: req.headers,
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.writeHead(502);
        res.end('Bad Gateway');
      });

      req.pipe(proxyReq);
      return;
    } catch (err) {
      console.error('Proxy configuration error:', err.message);
      res.writeHead(500);
      res.end('Proxy error');
      return;
    }
  }

  const cleanPath = requestUrl.split('?')[0];
  let relativePath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\//, '');
  let filePath = path.join(__dirname, 'dist', relativePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.createReadStream(filePath)
    .on('error', () => sendNotFound(res))
    .once('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
    })
    .pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server ready at http://0.0.0.0:${PORT}`);
  console.log(`Proxying ${PROXY_PREFIX} -> ${BACKEND_URL}`);
});
