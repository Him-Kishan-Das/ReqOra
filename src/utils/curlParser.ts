import type { ApiRequest, HttpMethod, KeyValueParam } from '../types/api';

export function parseCurlCommand(curlString: string): Partial<ApiRequest> | null {
  if (!curlString || !curlString.trim().toLowerCase().startsWith('curl')) {
    return null;
  }

  const cleanCurl = curlString.replace(/\\\n/g, ' ').replace(/\n/g, ' ').trim();

  let method: HttpMethod = 'GET';
  let url = '';
  const headers: KeyValueParam[] = [];
  let bodyData = '';

  const methodMatch = cleanCurl.match(/(?:-X|--request)\s+([A-Z]+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase() as HttpMethod;
  }

  const headerRegex = /(?:-H|--header)\s+(?:"([^"]+)"|'([^']+)'|([^\s]+))/g;
  let headerMatch;
  while ((headerMatch = headerRegex.exec(cleanCurl)) !== null) {
    const headerStr = headerMatch[1] || headerMatch[2] || headerMatch[3];
    if (headerStr && headerStr.includes(':')) {
      const parts = headerStr.split(':');
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      headers.push({
        id: Math.random().toString(36).substring(2, 9),
        key,
        value,
        enabled: true,
      });
    }
  }

  const bodyRegex = /(?:-d|--data|--data-raw|--data-binary)\s+(?:"([^"]+)"|'([^']+)'|([^\s]+))/;
  const bodyMatch = cleanCurl.match(bodyRegex);
  if (bodyMatch) {
    bodyData = bodyMatch[1] || bodyMatch[2] || bodyMatch[3] || '';
    if (!methodMatch) {
      method = 'POST';
    }
  }

  const tokens = cleanCurl.split(/\s+/);
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i].replace(/^['"]|['"]$/g, '');
    if (
      token.startsWith('http://') ||
      token.startsWith('https://') ||
      (token.includes('.') && !token.startsWith('-'))
    ) {
      url = token;
      break;
    }
  }

  if (!url.startsWith('http://') && !url.startsWith('https://') && url.length > 0) {
    url = 'https://' + url;
  }

  const params: KeyValueParam[] = [];
  if (url.includes('?')) {
    const urlParts = url.split('?');
    url = urlParts[0];
    const queryString = urlParts[1];
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params.push({
        id: Math.random().toString(36).substring(2, 9),
        key,
        value,
        enabled: true,
      });
    });
  }

  let bodyType: 'none' | 'json' | 'raw' = 'none';
  if (bodyData) {
    const isJsonHeader = headers.some(
      (h) => h.key.toLowerCase() === 'content-type' && h.value.includes('json')
    );
    if (isJsonHeader || (bodyData.startsWith('{') && bodyData.endsWith('}'))) {
      bodyType = 'json';
    } else {
      bodyType = 'raw';
    }
  }

  return {
    method,
    url,
    headers,
    params,
    body: {
      type: bodyType,
      rawJson: bodyType === 'json' ? bodyData : '',
      rawText: bodyType === 'raw' ? bodyData : '',
      formData: [],
      urlEncoded: [],
      graphqlQuery: '',
      graphqlVariables: '',
    },
  };
}
