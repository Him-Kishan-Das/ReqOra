import type { ApiRequest } from '../types/api';

export function generateCodeSnippet(request: ApiRequest, language: string): string {
  const { method, url, params, headers, body, auth } = request;

  const enabledParams = params.filter((p) => p.enabled && p.key.trim());
  let fullUrl = url || 'https://api.example.com/v1/resource';
  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
  }

  const headerMap: Record<string, string> = {};
  headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      headerMap[h.key] = h.value;
    });

  if (auth.type === 'bearer' && auth.bearerToken) {
    headerMap['Authorization'] = `Bearer ${auth.bearerToken}`;
  } else if (auth.type === 'basic' && (auth.username || auth.password)) {
    const credentials = btoa(`${auth.username}:${auth.password}`);
    headerMap['Authorization'] = `Basic ${credentials}`;
  } else if (auth.type === 'apikey' && auth.apiKeyAddTo === 'header' && auth.apiKeyKey) {
    headerMap[auth.apiKeyKey] = auth.apiKeyValue;
  }

  let bodyPayload = '';
  if (body.type === 'json' && body.rawJson) {
    bodyPayload = body.rawJson;
    if (!headerMap['Content-Type']) {
      headerMap['Content-Type'] = 'application/json';
    }
  } else if (body.type === 'raw' && body.rawText) {
    bodyPayload = body.rawText;
  } else if (body.type === 'x-www-form-urlencoded') {
    const activeEncoded = body.urlEncoded.filter((p) => p.enabled && p.key.trim());
    bodyPayload = activeEncoded
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    if (!headerMap['Content-Type']) {
      headerMap['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  }

  switch (language) {
    case 'curl': {
      let cmd = `curl -X ${method} "${fullUrl}"`;
      Object.entries(headerMap).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
      if (bodyPayload) {
        cmd += ` \\\n  -d '${bodyPayload.replace(/'/g, "'\\''")}'`;
      }
      return cmd;
    }

    case 'javascript-fetch': {
      const fetchHeaders = JSON.stringify(headerMap, null, 2);
      const options: string[] = [`method: '${method}'`];
      if (Object.keys(headerMap).length > 0) {
        options.push(`headers: ${fetchHeaders}`);
      }
      if (bodyPayload && method !== 'GET' && method !== 'HEAD') {
        options.push(`body: JSON.stringify(${bodyPayload.startsWith('{') ? bodyPayload : JSON.stringify(bodyPayload)})`);
      }

      return `fetch("${fullUrl}", {\n  ${options.join(',\n  ')}\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`;
    }

    case 'javascript-axios': {
      const config: string[] = [`method: '${method.toLowerCase()}'`, `url: '${fullUrl}'`];
      if (Object.keys(headerMap).length > 0) {
        config.push(`headers: ${JSON.stringify(headerMap, null, 2)}`);
      }
      if (bodyPayload && method !== 'GET' && method !== 'HEAD') {
        try {
          const parsed = JSON.parse(bodyPayload);
          config.push(`data: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          config.push(`data: '${bodyPayload}'`);
        }
      }

      return `import axios from 'axios';\n\naxios({\n  ${config.join(',\n  ')}\n})\n  .then(response => console.log(response.data))\n  .catch(error => console.error(error));`;
    }

    case 'python-requests': {
      let pythonCode = `import requests\n\nurl = "${fullUrl}"\n`;
      if (Object.keys(headerMap).length > 0) {
        pythonCode += `headers = ${JSON.stringify(headerMap, null, 4)}\n`;
      } else {
        pythonCode += `headers = {}\n`;
      }

      if (bodyPayload && method !== 'GET' && method !== 'HEAD') {
        if (body.type === 'json') {
          pythonCode += `payload = ${bodyPayload}\n`;
          pythonCode += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
        } else {
          pythonCode += `payload = "${bodyPayload}"\n`;
          pythonCode += `response = requests.${method.toLowerCase()}(url, headers=headers, data=payload)\n`;
        }
      } else {
        pythonCode += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
      }

      pythonCode += `\nprint(response.status_code)\nprint(response.json())`;
      return pythonCode;
    }

    case 'nodejs-native': {
      return `const https = require('https');\n\nconst options = {\n  method: '${method}',\n  headers: ${JSON.stringify(headerMap, null, 4)}\n};\n\nconst req = https.request('${fullUrl}', options, (res) => {\n  let data = '';\n  res.on('data', chunk => data += chunk);\n  res.on('end', () => console.log(JSON.parse(data)));\n});\n\n${bodyPayload ? `req.write('${bodyPayload}');\n` : ''}req.end();`;
    }

    case 'go': {
      return `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n\t"strings"\n)\n\nfunc main() {\n\turl := "${fullUrl}"\n\tpayload := strings.NewReader("${bodyPayload.replace(/"/g, '\\"')}")\n\treq, _ := http.NewRequest("${method}", url, payload)\n\n${Object.entries(headerMap).map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`).join('\n')}\n\n\tres, _ := http.DefaultClient.Do(req)\n\tdefer res.Body.Close()\n\tbody, _ := ioutil.ReadAll(res.Body)\n\tfmt.Println(string(body))\n}`;
    }

    case 'php-curl': {
      return `<?php\n$curl = curl_init();\ncurl_setopt_array($curl, [\n  CURLOPT_URL => "${fullUrl}",\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_CUSTOMREQUEST => "${method}",\n  CURLOPT_POSTFIELDS => '${bodyPayload}',\n  CURLOPT_HTTPHEADER => [\n${Object.entries(headerMap).map(([k, v]) => `    "${k}: ${v}"`).join(',\n')}\n  ],\n]);\n$response = curl_exec($curl);\ncurl_close($curl);\necho $response;`;
    }

    default:
      return `// Language ${language} not supported`;
  }
}
