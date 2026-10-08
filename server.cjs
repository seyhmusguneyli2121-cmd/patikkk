const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { spawn } = require('node:child_process');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4175);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT, 1–65535 arasında bir sayı olmalıdır.');
  process.exit(1);
}
if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('dist/index.html bulunamadı. Önce node build.cjs çalıştırın.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const reply = (status, message, extra = {}) => {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...extra });
    res.end(req.method === 'HEAD' ? undefined : message);
  };
  if (!['GET', 'HEAD'].includes(req.method)) {
    reply(405, 'Bu yöntem desteklenmiyor.', { Allow: 'GET, HEAD' });
    return;
  }
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.includes('\0')) throw new Error('Geçersiz adres');
    file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  } catch {
    reply(400, 'Geçersiz adres.');
    return;
  }
  if (!file.startsWith(root + path.sep)) {
    reply(403, 'Bu dosyaya erişilemiyor.');
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      reply(404, 'Dosya bulunamadı.');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const headers = {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Accept-Encoding'
    };
    const gzip = /\.(html|css|js|json|svg)$/.test(file) &&
      /\bgzip\b(?!\s*;\s*q=0(?:\.0*)?(?:\s*,|\s*$))/.test(req.headers['accept-encoding'] || '');
    const send = (body) => {
      if (gzip) headers['Content-Encoding'] = 'gzip';
      headers['Content-Length'] = body.length;
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (gzip) {
      zlib.gzip(data, (error, compressed) => {
        if (error) reply(500, 'Dosya gönderilemedi.');
        else send(compressed);
      });
    } else send(data);
  });
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `${port} numaralı port kullanımda. Açık Pati sunucusunu kapatın veya PORT değerini değiştirin.`
    : `Sunucu başlatılamadı: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`PatimiKoru: ${url}\nKapatmak için Ctrl+C.`);
  if (process.argv.includes('--open') && process.platform === 'win32') {
    const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], {
      windowsHide: true, stdio: 'ignore'
    });
    browser.on('error', () => console.log(`Tarayıcıdan ${url} adresini açın.`));
  }
});
