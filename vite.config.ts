import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allow self-signed or internal government portal SSL certs in local dev proxy
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cors-proxy-server',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res) => {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.statusCode = 204;
            res.end();
            return;
          }

          try {
            const reqUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const targetUrl = reqUrl.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing "url" query parameter' }));
              return;
            }

            let bodyChunks: Uint8Array[] = [];
            req.on('data', (chunk) => bodyChunks.push(chunk));
            req.on('end', async () => {
              try {
                const reqBody = Buffer.concat(bodyChunks);

                const forwardHeaders: Record<string, string> = {};
                for (const [key, value] of Object.entries(req.headers)) {
                  if (
                    key !== 'host' &&
                    key !== 'origin' &&
                    key !== 'referer' &&
                    key !== 'connection' &&
                    typeof value === 'string'
                  ) {
                    forwardHeaders[key] = value;
                  }
                }

                const fetchResponse = await fetch(targetUrl, {
                  method: req.method || 'GET',
                  headers: forwardHeaders,
                  body:
                    req.method !== 'GET' && req.method !== 'HEAD' && reqBody.length > 0
                      ? reqBody
                      : undefined,
                });

                res.statusCode = fetchResponse.status;

                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', '*');
                res.setHeader('Access-Control-Allow-Headers', '*');

                fetchResponse.headers.forEach((val, key) => {
                  if (
                    key !== 'content-encoding' &&
                    key !== 'transfer-encoding' &&
                    key !== 'access-control-allow-origin'
                  ) {
                    try {
                      res.setHeader(key, val);
                    } catch {}
                  }
                });

                const arrayBuffer = await fetchResponse.arrayBuffer();
                res.end(Buffer.from(arrayBuffer));
              } catch (err: any) {
                res.statusCode = 502;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'Proxy Connection Failed',
                    message: err.message || 'Failed to reach target URL via proxy.',
                  })
                );
              }
            });
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      },
    },
  ],
});
