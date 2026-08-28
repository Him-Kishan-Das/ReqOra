import type { ApiRequest, ApiResponse } from '../types/api';

export function handleMockRequest(request: ApiRequest): ApiResponse | null {
  const url = request.url.trim().toLowerCase();
  
  const isMockUrl = url.includes('mock.local') || url.includes('localhost:3000/mock') || url.includes('api.example.com');
  
  if (!isMockUrl) {
    return null;
  }

  const startTime = performance.now();
  let mockData: any = null;
  let status = 200;
  let statusText = 'OK';

  if (url.includes('/users')) {
    if (request.method === 'GET') {
      mockData = {
        page: 1,
        per_page: 6,
        total: 12,
        total_pages: 2,
        data: [
          { id: 1, email: "george.bluth@reqres.in", first_name: "George", last_name: "Bluth", avatar: "https://reqres.in/img/faces/1-image.jpg", status: "active" },
          { id: 2, email: "janet.weaver@reqres.in", first_name: "Janet", last_name: "Weaver", avatar: "https://reqres.in/img/faces/2-image.jpg", status: "active" },
          { id: 3, email: "emma.wong@reqres.in", first_name: "Emma", last_name: "Wong", avatar: "https://reqres.in/img/faces/3-image.jpg", status: "inactive" },
          { id: 4, email: "eve.holt@reqres.in", first_name: "Eve", last_name: "Holt", avatar: "https://reqres.in/img/faces/4-image.jpg", status: "active" }
        ],
        support: {
          url: "https://reqres.in/#support-heading",
          text: "ReqOra Studio Mock Service"
        }
      };
    } else if (request.method === 'POST') {
      status = 201;
      statusText = 'Created';
      try {
        const parsedBody = JSON.parse(request.body.rawJson || '{}');
        mockData = {
          id: Math.floor(Math.random() * 1000) + 100,
          ...parsedBody,
          createdAt: new Date().toISOString(),
          status: 'success'
        };
      } catch {
        mockData = {
          id: 101,
          name: "New User",
          createdAt: new Date().toISOString()
        };
      }
    }
  } else if (url.includes('/auth/login')) {
    if (request.method === 'POST') {
      mockData = {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        expiresIn: 3600,
        user: {
          id: "usr_99812",
          email: "admin@reqora.io",
          role: "Administrator"
        }
      };
    } else {
      status = 405;
      statusText = 'Method Not Allowed';
      mockData = { error: "Login endpoint only accepts POST requests" };
    }
  } else if (url.includes('/health')) {
    mockData = {
      status: "healthy",
      version: "1.0.0",
      uptime: "99.99%",
      services: {
        database: "connected",
        redis: "connected",
        queue: "operational"
      }
    };
  } else {
    mockData = {
      message: "Welcome to ReqOra Studio Mock Server!",
      endpoint: url,
      method: request.method,
      receivedHeaders: request.headers.reduce((acc, h) => {
        if (h.enabled && h.key) acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>),
      queryParameters: request.params.reduce((acc, p) => {
        if (p.enabled && p.key) acc[p.key] = p.value;
        return acc;
      }, {} as Record<string, string>),
      timestamp: new Date().toISOString()
    };
  }

  const endTime = performance.now();
  const rawText = JSON.stringify(mockData, null, 2);

  return {
    status,
    statusText,
    timeMs: Math.round(endTime - startTime + 45),
    sizeBytes: new Blob([rawText]).size,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-mock-service': 'ReqOra Engine v1.0',
      'access-control-allow-origin': '*',
      'cache-control': 'no-cache, no-store, must-revalidate',
      'date': new Date().toUTCString(),
    },
    data: mockData,
    rawText,
    contentType: 'application/json',
    timestamp: Date.now(),
  };
}
