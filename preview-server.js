'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');

const SITE_ORIGIN = 'https://zhyanawa.cyou';
const CLIENT = path.join(__dirname, 'client');
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

async function forwardApi(req, res, pathname, search) {
  const headers = { accept: req.headers.accept || '*/*' };
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  if (req.headers['accept-language']) headers['accept-language'] = req.headers['accept-language'];
  if (!['GET', 'HEAD'].includes(req.method)) headers.origin = SITE_ORIGIN;

  const controller = new AbortController();
  req.on('aborted', () => controller.abort());
  try {
    const upstream = await fetch(`${SITE_ORIGIN}${pathname}${search}`, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      duplex: 'half',
      redirect: 'manual',
      signal: controller.signal
    });
    if (pathname === '/api/health' && upstream.ok) {
      const health = await upstream.json();
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ online: Boolean(health.online), aiReady: Boolean(health.routerReachable || health.aiReady) }));
    }
    const responseHeaders = {};
    for (const name of [
      'content-type', 'cache-control', 'location', 'retry-after',
      'ratelimit-limit', 'ratelimit-remaining', 'ratelimit-reset',
      'x-zhyanawa-language', 'x-zhyanawa-guard', 'x-zhyanawa-grounding',
      'x-zhyanawa-research', 'x-zhyanawa-reasoning'
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders[name] = value;
    }
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length) responseHeaders['set-cookie'] = cookies;
    res.writeHead(upstream.status, responseHeaders);
    if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
    else res.end();
  } catch {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: { message: 'The service is temporarily unavailable.' } }));
  }
}

function serveFile(req, res, pathname) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { allow: 'GET, HEAD' });
    return res.end();
  }
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { decoded = ''; }
  if (!decoded || decoded.includes('\0') || decoded.includes('\\')) {
    res.writeHead(400);
    return res.end();
  }
  const name = decoded === '/' ? '/index.html' : path.extname(decoded) ? decoded : `${decoded}.html`;
  const file = path.resolve(CLIENT, `.${name}`);
  if (!file.startsWith(CLIENT + path.sep)) {
    res.writeHead(404);
    return res.end();
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': stat.size,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, 'http://127.0.0.1'); }
  catch { res.writeHead(400); return res.end(); }
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    return forwardApi(req, res, url.pathname, url.search);
  }
  return serveFile(req, res, url.pathname);
});

if (require.main === module) {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('Invalid PORT.');
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Zhyanawa preview: http://127.0.0.1:${PORT}`);
  });
}

module.exports = { server };
