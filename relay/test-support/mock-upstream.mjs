// A local mock upstream for relay tests. Records each request and answers
// with whatever the current handler returns.

import { createServer } from 'node:http';

export async function startMockUpstream() {
  const requests = [];
  let handler = () => ({ status: 200, body: {} });
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const entry = { method: req.method, url: req.url, headers: req.headers, body: raw ? JSON.parse(raw) : null };
      requests.push(entry);
      const out = await handler(entry);
      if (out.hang) return; // never answer: exercises the relay timeout
      res.writeHead(out.status ?? 200, { 'content-type': 'application/json' });
      res.end(typeof out.body === 'string' ? out.body : JSON.stringify(out.body));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    setHandler(fn) { handler = fn; },
    close: () => new Promise((r) => { server.closeAllConnections(); server.close(r); }),
  };
}

export async function startRelay(createRelay, config) {
  const lines = [];
  const server = createRelay(config, { log: (l) => lines.push(l) });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    lines,
    close: () => new Promise((r) => { server.closeAllConnections(); server.close(r); }),
  };
}
